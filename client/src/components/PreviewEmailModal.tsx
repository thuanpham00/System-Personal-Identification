import { Input } from "antd";
import React from "react";

interface Props {
  nameUser: string;
  setNameUser: (name: string) => void;
  reason: string;
  setReason: (reason: string) => void;
  instruction: string;
  setGuide: (guide: string) => void;
}

const CreatorVerificationGuideline = ({
  nameUser,
  reason,
  instruction,
  setGuide,
  setNameUser,
  setReason,
}: Props) => {
  return (
    <div
      style={{
        margin: "40px auto",
        maxWidth: 900,
        fontFamily: "Arial, sans-serif",
        fontSize: 14,
        color: "#222",
        lineHeight: 1.6,
        padding: "0 24px",
      }}
    >
      <h1
        style={{
          fontSize: 18,
          fontWeight: "bold",
          margin: "0 0 24px",
        }}
      >
        [Internal] Guideline - Từ chối định danh tài khoản – meCreator
      </h1>

      {/* Meta table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 28,
        }}
      >
        <tbody>
          <tr>
            <td style={metaLabelStyle}>Owner</td>
            <td style={metaValueStyle}>@Lê Thị Huyền</td>
            <td style={metaDescStyle}>Owner to complete</td>
          </tr>

          <tr>
            <td style={metaLabelStyle}>Status</td>
            <td style={metaValueStyle}>Review</td>
            <td style={metaDescStyle}>Owner to complete (DRAFT REVIEW ABANDONED AGREED)</td>
          </tr>

          <tr>
            <td style={metaLabelStyle}>Contributors</td>
            <td style={metaValueStyle}></td>
            <td style={metaDescStyle}>Contributor to complete</td>
          </tr>

          <tr>
            <td style={metaLabelStyle}>Tracker</td>
            <td style={metaValueStyle}>Internal Ops Guideline - Creator Verification</td>
            <td style={metaDescStyle}>Owner to complete</td>
          </tr>
        </tbody>
      </table>

      <hr style={hrStyle} />

      {/* Background */}
      <h2 style={h2Style}>Background</h2>

      <p>meCreator yêu cầu creator hoàn tất định danh để đảm bảo tính pháp lý và thanh toán.</p>

      <p>
        Trong quá trình xét duyệt, một số hồ sơ không đáp ứng yêu cầu cần được từ chối và hướng dẫn bổ sung.
      </p>

      <hr style={hrStyle} />

      {/* Problem Statement */}
      <h2 style={h2Style}>Problem Statement</h2>

      <p>Creator thường:</p>

      <ul style={ulStyle}>
        <li>Upload sai CCCD</li>
        <li>Thiếu thông tin</li>
        <li>Không hiểu lý do bị từ chối</li>
      </ul>

      <p>Ops xử lý thủ công =&gt; mất nhiều thời gian, thiếu nhất quán.</p>

      <hr style={hrStyle} />

      {/* Goals */}
      <h2 style={h2Style}>Goals & Non-goals</h2>

      <h3 style={h3Style}>Goals</h3>

      <ul style={ulStyle}>
        <li>Chuẩn hóa cách xác định lý do từ chối định danh</li>

        <li>Chuẩn hóa nội dung email phản hồi tự động gửi cho người dùng</li>

        <li>
          Nguyên tắc chung khi từ chối định danh: Mỗi hồ sơ chỉ gán 1 lý do từ chối chính =&gt; Mỗi lý do map
          với 1 template email cố định
        </li>
      </ul>

      <h3 style={h3Style}>Non-goals</h3>

      <ul style={ulStyle}>
        <li>Không áp dụng cho tài khoản doanh nghiệp</li>
      </ul>

      <hr style={hrStyle} />

      {/* Scope */}
      <h2 style={h2Style}>Scope</h2>

      <ul style={ulStyle}>
        <li>Creator cá nhân</li>
        <li>Định danh CCCD điện tử qua VNeID</li>
      </ul>

      <hr style={hrStyle} />

      {/* Case List */}
      <h2 style={h2Style}>Case List & Handling</h2>

      <h3 style={h3Style}>Lỗi liên quan đến CCCD / Định danh cá nhân</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "12px 0 24px",
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Case</th>
            <th style={tableHeaderStyle}>Mẫu trả lời</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={caseLeftStyle}>Thiếu căn cước công dân (Không tải lên bất kỳ hình ảnh CCCD nào)</td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Thiếu căn cước công dân (không có hình ảnh CCCD được tải lên trong hồ sơ).
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng mở ứng dụng VNeID.
              <br />
              Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"
              <br />
              Chụp full màn hình hiển thị:
              <br />
              1. Mặt trước (ảnh chân dung và thông tin cơ bản)
              <br />
              2. Mặt sau (thông tin bổ sung)
              <br />
              <em>Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa</em>
            </td>
          </tr>

          <tr>
            <td style={caseLeftStyle}>
              <span style={caseLabelStyle}>Sai loại hình ảnh CCCD (KHÔNG chụp từ VNeID)</span>

              <span style={caseSubStyle}>
                Ảnh chụp CCCD vật lý
                <br />
                Ảnh scan/photo lại từ giấy
                <br />
                Ảnh chụp màn hình không phải từ app VNeID
              </span>
            </td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không chụp từ ứng dụng VNeID)
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng mở ứng dụng VNeID.
              <br />
              Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"
              <br />
              Chụp full màn hình hiển thị:
              <br />
              &nbsp;&nbsp;1. Mặt trước (ảnh chân dung + thông tin cơ bản)
              <br />
              &nbsp;&nbsp;2. Mặt sau (thông tin bổ sung)
              <br />
              <em>Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa</em>
            </td>
          </tr>

          <tr>
            <td style={caseLeftStyle}>Thiếu hình ảnh mặt trước hoặc mặt sau CCCD điện tử</td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Hồ sơ định danh của bạn chưa đầy đủ do thiếu hình ảnh mặt trước hoặc mặt sau của CCCD điện tử
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng chụp và tải lên đầy đủ cả hai mặt CCCD điện tử từ ứng dụng VNeID (mặt trước và mặt sau)
            </td>
          </tr>

          <tr>
            <td style={caseLeftStyle}>
              <span style={caseLabelStyle}>Hình ảnh CCCD điện tử không rõ / không hợp lệ</span>

              <span style={caseSubStyle}>
                Ảnh mờ, rung, vỡ nét
                <br />
                Bị che góc
                <br />
                Bị cắt xén
                <br />
                Có dấu hiệu chỉnh sửa
              </span>
            </td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không hiển thị đầy đủ thông tin bổ sung chi
              tiết)
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />- Vui lòng mở ứng dụng VNeID.
              <br />- Chọn mục "Ví giấy tờ" =&gt; "Thẻ Căn cước/CCCD" =&gt; "Căn cước điện tử"
              <br />- Chụp full màn hình hiển thị: Mặt trước (ảnh chân dung + thông tin cơ bản)
              <br />-
              <em>
                Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa, chụp đầy đủ tới hết ngày cấp
                CCCD
              </em>
            </td>
          </tr>

          <tr>
            <td style={caseLeftStyle}>
              <span style={caseLabelStyle}>Thông tin CCCD không khớp với thông tin tài khoản</span>

              <span style={caseSubStyle}>
                Họ tên trên CCCD không trùng tên tài khoản
                <br />
                Số CCCD khác mã số thuế
                <br />
                Ngày cấp / nơi cấp không hợp lệ
              </span>
            </td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Thông tin trên CCCD điện tử không khớp với thông tin tài khoản đã đăng ký trên hệ thống
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng kiểm tra và đảm bảo họ tên, số CCCD và các thông tin cá nhân trên tài khoản trùng khớp
              hoàn toàn với CCCD điện tử
              <br />
              <br />
              Vui lòng cập nhật mã số thuế cá nhân trong app VNeID
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vào VNeID --&gt; Chọn Ví giấy tờ
              <br />
              Chọn mục Thông tin thuế
              <br />
              Chọn Đồng bộ thông tin / Cập nhật
              <br />
              Tải ứng dụng Etax về chọn đăng nhập bằng VNeID để kiểm tra MST cá nhân đã được cập nhật thành số
              CCCD
            </td>
          </tr>
        </tbody>
      </table>

      <h3 style={h3Style}>Lỗi liên quan đến tài khoản ngân hàng</h3>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "12px 0 24px",
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Case</th>
            <th style={tableHeaderStyle}>Mẫu trả lời</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td style={caseLeftStyle}>
              <span style={caseLabelStyle}>Tài khoản ngân hàng không hợp lệ</span>

              <span style={caseSubStyle}>
                Sai số tài khoản
                <br />
                Không tồn tại
                <br />
                Không xác minh được
              </span>
            </td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Thông tin tài khoản ngân hàng được cung cấp không hợp lệ hoặc không xác minh được
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng kiểm tra lại số tài khoản, tên ngân hàng và chi nhánh, sau đó cập nhật thông tin chính
              xác
            </td>
          </tr>

          <tr>
            <td style={caseLeftStyle}>Tên chủ tài khoản ngân hàng không trùng CCCD</td>

            <td style={caseRightStyle}>
              <strong>Lý do từ chối định danh:</strong>
              <br />
              Tên chủ tài khoản ngân hàng không trùng khớp với thông tin trên CCCD điện tử
              <br />
              <br />
              <strong>Hướng dẫn bổ sung:</strong>
              <br />
              Vui lòng sử dụng tài khoản ngân hàng chính chủ, có tên trùng khớp với CCCD điện tử để hoàn tất
              định danh
            </td>
          </tr>
        </tbody>
      </table>

      <h3 style={h3Style}>Lỗi khác</h3>

      <ul style={ulStyle}>
        <li>Thiếu thông tin bắt buộc khác</li>
        <li>Thiếu email nhận hợp đồng</li>
        <li>Thiếu địa chỉ chi tiết</li>

        <li>
          Để được duyệt tham gia chiến dịch Vaseline Creator, bạn vui lòng tham gia chiến dịch nền tảng và
          liên kết với tài khoản TikTok đăng bài (Điều kiện tài khoản TikTok có tối thiểu 1000 follower)
        </li>
      </ul>

      <hr style={hrStyle} />

      {/* Email Template */}
      <h2 style={h2Style}>MẪU EMAIL CHUNG</h2>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 4,
          padding: "24px 28px",
          margin: "16px 0 28px",
          background: "#fafafa",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: 16 }}>
          Tiêu đề: Thông báo: Yêu cầu định danh tài khoản của bạn chưa được chấp nhận
        </p>

        <div>
          <p className="flex items-center gap-2">
            <span>Chào</span>
            <Input value={nameUser} onChange={(e) => setNameUser(e.target.value)} />
          </p>

          <p className="mb-4">
            Cảm ơn bạn đã gửi yêu cầu định danh tài khoản trên meCreator. Sau khi xem xét, chúng tôi rất tiếc
            phải thông báo rằng yêu cầu định danh của bạn chưa được chấp nhận do không đáp ứng một số tiêu chí
            theo quy định.
          </p>

          <p>
            <strong>Lý do từ chối định danh:</strong>
          </p>

          <p style={{ color: "#888", fontStyle: "italic" }}>
            {<Input value={reason} onChange={(e) => setReason(e.target.value)} />}
          </p>

          <p className="mt-4">
            <strong>Hướng dẫn bổ sung:</strong>
          </p>

          <p className="mb-4" style={{ color: "#888", fontStyle: "italic" }}>
            {<Input value={instruction} onChange={(e) => setGuide(e.target.value)} />}
          </p>

          <p>
            Bạn vui lòng cập nhật lại thông tin và gửi lại yêu cầu định danh để chúng tôi tiếp tục xét duyệt.
          </p>

          <p>Rất mong sớm nhận được thông tin chính xác từ bạn để hoàn tất đăng ký.</p>

          <p>
            <strong>Hướng dẫn tiếp theo:</strong>
          </p>

          <p>Bạn có thể cập nhật và gửi lại yêu cầu định danh bằng cách:</p>

          <ul style={ulStyle}>
            <li>Đăng nhập vào tài khoản của bạn trên meCreator</li>

            <li>Truy cập mục "Hồ sơ của tôi" =&gt; "Thông tin thanh toán"</li>

            <li>Chỉnh sửa hoặc bổ sung tài liệu theo yêu cầu</li>
          </ul>

          <p>
            Chúng tôi khuyến khích bạn kiểm tra kỹ các thông tin trước khi gửi lại để đảm bảo quá trình định
            danh được hoàn thành nhanh chóng.
          </p>

          <p>
            Nếu bạn cần hỗ trợ thêm hoặc có bất kỳ câu hỏi nào khác, vui lòng liên hệ:
            <a href="mailto:op.brand@themetub.com"> op.brand@themetub.com</a>
          </p>

          <p>
            Trân trọng,
            <br />
            <strong>meCreator Team</strong>
          </p>
        </div>
      </div>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Checklist cho Ops</h2>

      <hr style={hrStyle} />

      <h2 style={h2Style}>Open Discussion / Future Improvement</h2>
    </div>
  );
};

export default CreatorVerificationGuideline;

/* ===================== styles ===================== */

const metaLabelStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px 12px",
  verticalAlign: "top",
  fontWeight: "bold",
  width: 140,
  background: "#f5f5f5",
};

const metaValueStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px 12px",
  verticalAlign: "top",
};

const metaDescStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px 12px",
  verticalAlign: "top",
  color: "#888",
  fontSize: 12,
};

const h2Style: React.CSSProperties = {
  fontSize: 15,
  fontWeight: "bold",
  margin: "28px 0 8px",
};

const h3Style: React.CSSProperties = {
  fontSize: 14,
  fontWeight: "bold",
  margin: "20px 0 6px",
};

const ulStyle: React.CSSProperties = {
  margin: "4px 0 8px 20px",
  padding: 0,
};

const hrStyle: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #ddd",
  margin: "28px 0",
};

const tableHeaderStyle: React.CSSProperties = {
  background: "#f0f0f0",
  border: "1px solid #ccc",
  padding: "10px 14px",
  fontWeight: "bold",
  textAlign: "left",
};

const caseLeftStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px 14px",
  verticalAlign: "top",
  width: "35%",
  background: "#fafafa",
};

const caseRightStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px 14px",
  verticalAlign: "top",
};

const caseLabelStyle: React.CSSProperties = {
  fontWeight: "bold",
  color: "#333",
  display: "block",
  marginBottom: 4,
};

const caseSubStyle: React.CSSProperties = {
  color: "#555",
  fontSize: 13,
};
