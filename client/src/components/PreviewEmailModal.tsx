import { Input, Select } from "antd";
import React, { useMemo } from "react";

interface Props {
  nameUser: string;
  setNameUser: (name: string) => void;
  reason: string;
  setReason: (reason: string) => void;
  instruction: string;
  setGuide: (guide: string) => void;
  selectedReasons: number[];
  setSelectedReasons: (reasons: number[]) => void;
}

const dataReason = [
  {
    key: 1,
    value: "1/ Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không chụp từ ứng dụng VNeID)",
    instruct: 1,
  },
  {
    key: 2,
    value:
      "2/ Ảnh CCCD điện tử bạn tải lên không đúng yêu cầu (không hiển thị đầy đủ thông tin bổ sung chi tiết)",
    instruct: 2,
  },
  {
    key: 3,
    value: "3/ Thiếu căn cước công dân (không có hình ảnh CCCD được tải lên trong hồ sơ)",
    instruct: 3,
  },
  {
    key: 4,
    value: "4/ Nội dung Nơi Cấp CCCD chưa chính xác",
    instruct: 4,
  },
  {
    key: 5,
    value: "5/ Nội dung Họ và tên chưa chính xác",
    instruct: 5,
  },
  {
    key: 6,
    value: "6/ Nội dung Mã số CCCD chưa chính xác",
    instruct: 6,
  },
  {
    key: 7,
    value: "7/ Nội dung Mã số Thuế chưa chính xác",
    instruct: 7,
  },
];

const dataInstruction = [
  {
    key: 1,
    value: `- Vui lòng mở ứng dụng VNeID.
- Chọn mục "Ví giấy tờ" => "Thẻ Căn cước/CCCD" => "Căn cước điện tử"
- Chụp full màn hình hiển thị: Mặt trước (ảnh chân dung + thông tin cơ bản)
- Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa, chụp đầy đủ tới hết ngày cấp CCCD`,
  },
  {
    key: 2,
    value: `- Vui lòng mở ứng dụng VNeID.
- Chọn mục "Ví giấy tờ" => "Thẻ Căn cước/CCCD" => "Căn cước điện tử"
- Chụp full màn hình hiển thị: Mặt trước (ảnh chân dung + thông tin cơ bản)
- Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa, chụp đầy đủ tới hết ngày cấp CCCD
`,
  },
  {
    key: 3,
    value: `- Vui lòng mở ứng dụng VNeID.
- Chọn mục "Ví giấy tờ" => "Thẻ Căn cước/CCCD" => "Căn cước điện tử"
- Chụp full màn hình hiển thị: Mặt trước (ảnh chân dung + thông tin cơ bản)
- Lưu ý: Đảm bảo hình ảnh rõ nét, không che khuất, không chỉnh sửa, chụp đầy đủ tới hết ngày cấp CCCD
`,
  },
  {
    key: 4,
    value: `Vui lòng nhập thông tin Nơi cấp CCCD là “CỤC CẢNH SÁT” hoặc “BỘ CÔNG AN”`,
  },
  {
    key: 5,
    value: `Vui lòng kiểm tra Nội dung Họ và tên và nhập lại thông tin in hoa đầy đủ có dấu`,
  },
  {
    key: 6,
    value: `Vui lòng kiểm tra và nhập lại thông tin Mã số CCCD chính xác`,
  },
  {
    key: 7,
    value: `Vui lòng kiểm tra và nhập lại thông tin Mã số Thuế chính xác`,
  },
];

const CreatorVerificationGuideline = ({
  nameUser,
  reason,
  instruction,
  selectedReasons,
  setGuide,
  setNameUser,
  setReason,
  setSelectedReasons,
}: Props) => {
  const reasonOptions = useMemo(
    () =>
      dataReason.map((item) => ({
        label: item.value,
        value: item.key,
      })),
    [],
  );

  const handleReasonChange = (values: number[]) => {
    setSelectedReasons(values);

    const reasonText = dataReason
      .filter((item) => values.includes(item.key))
      .map((item) => `- ${item.value}`)
      .join("\n");

    const instructionText = dataReason
      .filter((item) => values.includes(item.key))
      .map((item) => dataInstruction.find((guide) => guide.key === item.instruct)?.value)
      .filter(Boolean)
      .join("\n\n");

    setReason(reasonText);
    setGuide(instructionText);
  };

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
          <Select
            mode="multiple"
            allowClear
            placeholder="Chọn lý do"
            options={reasonOptions}
            value={selectedReasons}
            onChange={handleReasonChange}
            style={{ width: "100%" }}
          />

          <p className="mt-3" style={{ color: "#888", fontStyle: "italic" }}>
            <Input.TextArea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoSize={{ minRows: 3 }}
            />
          </p>

          <p className="mt-4">
            <strong>Hướng dẫn bổ sung:</strong>
          </p>

          <p className="mb-4" style={{ color: "#888", fontStyle: "italic" }}>
            <Input.TextArea
              value={instruction}
              onChange={(e) => setGuide(e.target.value)}
              autoSize={{ minRows: 4 }}
            />
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
