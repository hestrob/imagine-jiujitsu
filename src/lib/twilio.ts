import { Settings } from "./db";

export const TWILIO_TRIAL_SANDBOX_FROM = "+17372324091";
export const TWILIO_TRIAL_VERIFIED_TO = "+19166610125";

export const TWILIO_TRIAL_TEMPLATES = [
  { id: "sms_appointment_reminders", label: "Appointment Reminders" },
  { id: "sms_event_notifications", label: "Event Notifications" },
  { id: "sms_account_alerts", label: "Account Alerts" },
  { id: "sms_order_confirmation", label: "Order Confirmation" },
  { id: "sms_delivery_updates", label: "Delivery Updates" },
  { id: "sms_customer_support", label: "Customer Support" },
  { id: "sms_marketing_promotions", label: "Marketing Promotions" },
  { id: "sms_2fa", label: "2FA Verification" },
  { id: "sms_feedback_surveys", label: "Feedback Surveys" },
  { id: "sms_internal_alerts", label: "Internal Alerts" },
] as const;

const VALID_TRIAL_TEMPLATE_IDS = new Set<string>(
  TWILIO_TRIAL_TEMPLATES.map((t) => t.id)
);

export type TwilioAccountStatus = {
  configured: boolean;
  connected: boolean;
  accountSidMasked?: string;
  accountName?: string;
  accountType?: string; // "Trial" | "Full"
  accountStatus?: string; // "active"
  fromPhone?: string;
  ownedNumbers?: { phoneNumber: string; friendlyName: string }[];
  verifiedCallerIds?: { phoneNumber: string; friendlyName: string }[];
  error?: string;
};

export function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/[^0-9+]/g, "");
  if (!digits) return "";
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export function getTwilioCredentials() {
  const s = Settings.all();
  const accountSid = (s.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (s.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN || "").trim();
  const fromPhone = (
    s.twilioFromPhone ||
    process.env.TWILIO_FROM_PHONE ||
    TWILIO_TRIAL_SANDBOX_FROM
  ).trim();
  return { accountSid, authToken, fromPhone };
}

function makeAuthHeader(accountSid: string, authToken: string): string {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export async function resolveTwilioFromPhone(
  accountSid: string,
  authToken: string,
  configuredFrom?: string
): Promise<string> {
  if (configuredFrom && configuredFrom.trim()) {
    return normalizePhoneE164(configuredFrom.trim());
  }
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PageSize=5`,
      {
        headers: { Authorization: makeAuthHeader(accountSid, authToken) },
        cache: "no-store",
      }
    );
    if (res.ok) {
      const data = await res.json();
      const first = data?.incoming_phone_numbers?.[0]?.phone_number;
      if (first) {
        Settings.set("twilioFromPhone", first);
        return first;
      }
    }
  } catch (err) {
    console.error("Failed to auto-discover Twilio phone number:", err);
  }
  return TWILIO_TRIAL_SANDBOX_FROM;
}

export async function getTwilioStatus(): Promise<TwilioAccountStatus> {
  const { accountSid, authToken, fromPhone } = getTwilioCredentials();
  if (!accountSid || !authToken) {
    return { configured: false, connected: false };
  }

  const accountSidMasked =
    accountSid.length > 10
      ? `${accountSid.slice(0, 6)}…${accountSid.slice(-4)}`
      : accountSid;

  const authHeader = makeAuthHeader(accountSid, authToken);

  try {
    const [acctRes, numsRes, callerRes] = await Promise.all([
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }),
      fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PageSize=10`,
        {
          headers: { Authorization: authHeader },
          cache: "no-store",
        }
      ),
      fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/OutgoingCallerIds.json?PageSize=20`,
        {
          headers: { Authorization: authHeader },
          cache: "no-store",
        }
      ),
    ]);

    if (!acctRes.ok) {
      const errData = await acctRes.json().catch(() => ({}));
      return {
        configured: true,
        connected: false,
        accountSidMasked,
        error: errData?.message || `Twilio returned status ${acctRes.status}`,
      };
    }

    const acct = await acctRes.json();
    const numsData = numsRes.ok ? await numsRes.json() : { incoming_phone_numbers: [] };
    const callerData = callerRes.ok ? await callerRes.json() : { outgoing_caller_ids: [] };

    const ownedNumbers = (numsData.incoming_phone_numbers || []).map(
      (n: { phone_number: string; friendly_name: string }) => ({
        phoneNumber: n.phone_number,
        friendlyName: n.friendly_name,
      })
    );

    const verifiedCallerIds = (callerData.outgoing_caller_ids || []).map(
      (c: { phone_number: string; friendly_name: string }) => ({
        phoneNumber: c.phone_number,
        friendlyName: c.friendly_name,
      })
    );

    const effectiveFrom =
      ownedNumbers[0]?.phoneNumber ||
      (fromPhone && normalizePhoneE164(fromPhone)) ||
      TWILIO_TRIAL_SANDBOX_FROM;

    return {
      configured: true,
      connected: true,
      accountSidMasked,
      accountName: acct.friendly_name,
      accountType: acct.type,
      accountStatus: acct.status,
      fromPhone: effectiveFrom,
      ownedNumbers,
      verifiedCallerIds,
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      accountSidMasked,
      error: err instanceof Error ? err.message : "Unable to reach Twilio API",
    };
  }
}

export async function provisionWoodlandTrialNumber(): Promise<{
  ok: boolean;
  phoneNumber?: string;
  error?: string;
}> {
  const { accountSid, authToken } = getTwilioCredentials();
  if (!accountSid || !authToken) {
    return { ok: false, error: "Twilio Account SID and Auth Token are not configured." };
  }
  const authHeader = makeAuthHeader(accountSid, authToken);

  try {
    const existingRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json?PageSize=5`,
      { headers: { Authorization: authHeader }, cache: "no-store" }
    );
    if (existingRes.ok) {
      const existingData = await existingRes.json();
      const firstExisting = existingData?.incoming_phone_numbers?.[0]?.phone_number;
      if (firstExisting) {
        Settings.set("twilioFromPhone", firstExisting);
        return { ok: true, phoneNumber: firstExisting };
      }
    }

    let availRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/US/Local.json?AreaCode=530&InLocality=Woodland&SmsEnabled=true&PageSize=5`,
      { headers: { Authorization: authHeader }, cache: "no-store" }
    );
    let availData = availRes.ok ? await availRes.json() : null;
    let candidate = availData?.available_phone_numbers?.[0]?.phone_number;

    if (!candidate) {
      availRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/US/Local.json?AreaCode=530&SmsEnabled=true&PageSize=5`,
        { headers: { Authorization: authHeader }, cache: "no-store" }
      );
      availData = availRes.ok ? await availRes.json() : null;
      candidate = availData?.available_phone_numbers?.[0]?.phone_number;
    }

    if (!candidate) {
      return { ok: false, error: "No available (530) numbers found on Twilio." };
    }

    const buyBody = new URLSearchParams({
      PhoneNumber: candidate,
      FriendlyName: "Imagine Jiu Jitsu Woodland",
    });

    const buyRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: buyBody.toString(),
      }
    );

    const buyData = await buyRes.json();
    if (!buyRes.ok) {
      return {
        ok: false,
        error:
          buyData?.message ||
          `Twilio error (${buyRes.status}): Unable to claim phone number.`,
      };
    }

    const claimed = buyData.phone_number || candidate;
    Settings.set("twilioFromPhone", claimed);
    return { ok: true, phoneNumber: claimed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to provision Twilio number.",
    };
  }
}

function inferTrialTemplate(text: string): string {
  if (VALID_TRIAL_TEMPLATE_IDS.has(text.trim())) {
    return text.trim();
  }
  const lower = text.toLowerCase();
  if (lower.includes("schedule") || lower.includes("class") || lower.includes("reminder")) {
    return "sms_appointment_reminders";
  }
  if (lower.includes("promotion") || lower.includes("event") || lower.includes("open mat")) {
    return "sms_event_notifications";
  }
  return "sms_account_alerts";
}

export async function sendTwilioBulkSms(
  phones: string[],
  bodyText: string
): Promise<{
  attempted: number;
  sent: number;
  failed: number;
  fromPhone: string;
  usedTrialTemplate?: string;
  errors: string[];
}> {
  const { accountSid, authToken, fromPhone: configuredFrom } = getTwilioCredentials();
  if (!accountSid || !authToken) {
    return {
      attempted: 0,
      sent: 0,
      failed: 0,
      fromPhone: "",
      errors: ["Twilio credentials not configured."],
    };
  }

  const fromPhone = await resolveTwilioFromPhone(accountSid, authToken, configuredFrom);
  const uniquePhones = Array.from(
    new Set(phones.map((p) => normalizePhoneE164(p)).filter(Boolean))
  );

  if (uniquePhones.length === 0) {
    return { attempted: 0, sent: 0, failed: 0, fromPhone, errors: [] };
  }

  const authHeader = makeAuthHeader(accountSid, authToken);
  let sent = 0;
  let failed = 0;
  let usedTrialTemplate: string | undefined;
  const errors: string[] = [];

  for (const to of uniquePhones) {
    try {
      const bodyParams = new URLSearchParams({
        To: to,
        From: fromPhone,
        Body: bodyText,
      });

      let res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        }
      );

      let data = await res.json().catch(() => ({}));

      // Twilio Trial Sandbox (code 572006) requires predefined template names (e.g. sms_appointment_reminders)
      if (!res.ok && data?.code === 572006) {
        const fallbackTemplate = inferTrialTemplate(bodyText);
        const retryParams = new URLSearchParams({
          To: to,
          From: fromPhone,
          Body: fallbackTemplate,
        });
        res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: retryParams.toString(),
          }
        );
        data = await res.json().catch(() => ({}));
        if (res.ok) {
          usedTrialTemplate = fallbackTemplate;
        }
      }

      if (res.ok) {
        sent++;
      } else {
        failed++;
        const msg = data?.message || `HTTP ${res.status}`;
        if (!errors.includes(msg)) errors.push(msg);
      }
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : "Network error";
      if (!errors.includes(msg)) errors.push(msg);
    }
  }

  return {
    attempted: uniquePhones.length,
    sent,
    failed,
    fromPhone,
    usedTrialTemplate,
    errors,
  };
}
