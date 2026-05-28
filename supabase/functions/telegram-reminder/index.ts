const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_FROM = Deno.env.get("RESEND_EMAIL_FROM")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async () => {
  try {
    const now = new Date();

    // Việt Nam UTC+7
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0 - 7, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setUTCHours(24 - 7, 59, 59, 999);

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reminders?is_sent=eq.false&remind_at=gte.${startOfDay.toISOString()}&remind_at=lte.${endOfDay.toISOString()}&select=*`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    const reminders = await res.json();

    if (!reminders || reminders.length === 0) {
      return new Response("No reminders today");
    }

    const html = `
      <div style="font-family: Arial, sans-serif">
        <h2>🔔 Danh sách cần nhắc hôm nay</h2>

        <table 
          border="1" 
          cellpadding="8" 
          cellspacing="0"
          style="border-collapse: collapse; width: 100%;"
        >
          <thead>
            <tr>
              <th>STT</th>
              <th>Nội dung</th>
              <th>Thời gian nhắc</th>
            </tr>
          </thead>

          <tbody>
            ${
      reminders
        .map(
          (r: any, index: number) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${r.message}</td>
                    <td>
                      ${
            new Date(r.remind_at).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })
          }
                    </td>
                  </tr>
                `,
        )
        .join("")
    }
          </tbody>
        </table>

        <br />

        <p>
          Tổng cộng: <strong>${reminders.length}</strong> lịch nhắc
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: "huyenle30723@gmail.com",
        subject: `🔔 Người yêu cũ vùa nhắc bạn. Hãy nhanh chóng kiểm tra!!!!`,
        html,
      }),
    });

    await emailRes.json();

    const ids = reminders.map((r: any) => r.id);

    await fetch(
      `${SUPABASE_URL}/rest/v1/reminders?id=in.(${ids.join(",")})`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_sent: true,
        }),
      },
    );

    return new Response(
      JSON.stringify({
        success: true,
        total: reminders.length,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
});
