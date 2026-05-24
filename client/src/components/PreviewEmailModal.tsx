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
      <div
        style={{
          background: "#fafafa",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: 16 }}>
          Thông báo: Yêu cầu định danh tài khoản của bạn chưa được chấp nhận
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

          <p className="mt-4">
            Trân trọng,
            <br />
            <strong>meCreator Team</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatorVerificationGuideline;

const ulStyle: React.CSSProperties = {
  margin: "4px 0 8px 20px",
  padding: 0,
};
