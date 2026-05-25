/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card, Col, Row, Upload, Image, Descriptions, Tag, Alert, Space, message } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { supabase } from "../../utils/supabase";
import { v4 as uuidv4 } from "uuid";

type Data = {
  status: string;
  ho_ten: string;
  so_cccd: string;
  ngay_cap: string;
  noi_cap: string;
  email: string;
  username: string;
};

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function PersonalIdentification() {
  const [loading, setLoading] = useState(false);
  const [formFile, setFormFile] = useState<UploadFile | null>(null);
  const [cccdFile, setCccdFile] = useState<UploadFile | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [data, setData] = useState<Data | null>(null);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const uploadToSupabase = async (fileObj: File) => {
    const fileExt = fileObj.name.split(".").pop() || "png";

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage.from("DataImageSave").upload(fileName, fileObj, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) throw error;

    const { data: publicData } = supabase.storage.from("DataImageSave").getPublicUrl(data.path);

    return publicData.publicUrl;
  };

  const [pasteTarget, setPasteTarget] = useState<"form" | "cccd" | "other">("form");

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();

          if (!blob) return;

          setLoading(true);
          try {
            const file = new File([blob], `paste-${Date.now()}.png`, {
              type: blob.type,
            });

            const publicUrl = await uploadToSupabase(file);

            // Ensure file is RcFile type with required properties
            const uploadFile: UploadFile = {
              uid: Date.now().toString(),
              name: file.name,
              status: "done",
              url: publicUrl,
              thumbUrl: publicUrl,
              percent: 100,
              type: file.type,
              originFileObj: file as any,
            };

            if (pasteTarget === "form") {
              setFormFile(uploadFile);
            }

            if (pasteTarget === "cccd") {
              setCccdFile(uploadFile);
            }

            if (pasteTarget === "other") {
              setFileList((prev) => [...prev, uploadFile]);
            }

            message.success("Paste ảnh thành công!");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error: any) {
            message.error("Upload ảnh thất bại!");
          } finally {
            setLoading(false);
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [pasteTarget]);

  const handleUpload: UploadProps["customRequest"] = async ({ file, onError, onSuccess }) => {
    try {
      const publicUrl = await uploadToSupabase(file as File);

      onSuccess?.({ publicUrl });
    } catch (err) {
      onError?.(err as Error);
    }
  };

  const handleChangeForm: UploadProps["onChange"] = ({ fileList }) => {
    const file = fileList[0];

    if (!file) {
      setFormFile(null);
      return;
    }

    const responseUrl = (file.response as any)?.publicUrl;
    const updated = responseUrl ? { ...file, url: responseUrl } : file;

    setFormFile(updated);
  };

  const handleChangeCccd: UploadProps["onChange"] = ({ fileList }) => {
    const file = fileList[0];

    if (!file) {
      setCccdFile(null);
      return;
    }

    const responseUrl = (file.response as any)?.publicUrl;
    const updated = responseUrl ? { ...file, url: responseUrl } : file;

    setCccdFile(updated);
  };

  const handleIdentification = async () => {
    if (!formFile || !cccdFile) {
      alert("Vui lòng chọn đủ 2 ảnh (Form + CCCD).");
      return;
    }

    setLoading(true);

    const formUrl = formFile.url;
    const cccdUrl = cccdFile.url;
    const imageOrder = fileList.map((f) => f.url);

    const res = await fetch("https://system-personal-identification.onrender.com/verify-two", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        form_image_url: formUrl,
        cccd_image_url: cccdUrl,
        imageOther: imageOrder,
      }),
    });

    const result = await res.json();

    setData({
      status: result.status,
      ho_ten: result.form_data.ho_ten,
      so_cccd: result.form_data.so_cccd,
      ngay_cap: result.form_data.ngay_cap,
      noi_cap: result.form_data.noi_cap,
      email: result.merged_other_fields.email_nhan_hop_dong,
      username: result.merged_other_fields.ten_tai_khoan,
    });
    setLoading(false);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    const updatedFileList = newFileList.map((f) => {
      const responseUrl = (f.response as any)?.publicUrl;
      const update = { ...f, url: responseUrl };
      return update;
    });
    setFileList(updatedFileList);
  };

  const handleSaveData = async () => {
    await supabase
      .from("data") // tên table của bạn
      .insert({
        id: uuidv4(),
        ho_ten: data?.ho_ten || "...",
        cccd_number: data?.so_cccd || "...",
        ngay_cap: data?.ngay_cap || "...",
        noi_cap: data?.noi_cap || "...",
        email_nhan_hd: data?.email || "...",
        username: data?.username || "...",
        created_at: new Date().toISOString(),
        status: data?.status || "...",
      })
      .select(); // 👈 thêm cái này;

    message.success("Lưu data thành công!");
  };

  const handleClearImage = () => {
    setFormFile(null);
    setCccdFile(null);
    setFileList([]);
    setData(null);
  };

  return (
    <Card
      title="Personal Identification"
      bordered={false}
      className="w-full h-[calc(100vh-120px)] overflow-auto"
    >
      <Row gutter={16}>
        <Col span={24}>
          <Alert
            message="Hướng dẫn tải ảnh"
            description={
              <div className="space-y-2">
                <p>
                  • Ảnh <b>Form</b>: Vui lòng tải đúng ảnh chứa thông tin biểu mẫu cần xác thực.
                </p>

                <p>
                  • Ảnh <b>CCCD</b>: Vui lòng tải ảnh căn cước công dân rõ nét, không bị mờ hoặc che khuất
                  thông tin.
                </p>

                <p>
                  • Ảnh <b>Khác</b>: Có thể tải thêm ảnh bổ sung để hệ thống OCR đọc thông tin hỗ trợ.
                </p>

                <p className="text-red-500">
                  Lưu ý: Chọn sai loại ảnh hoặc ảnh không rõ nét có thể khiến hệ thống phân tích sai dữ liệu.
                </p>
              </div>
            }
            type="info"
            showIcon
            closable
            className="mb-4! rounded-xl"
          />
        </Col>
        <Col span={8}>
          <div>
            <div className="flex gap-2 items-center mb-4">
              <h3 className="font-semibold">Ảnh Form</h3>
              <Button onClick={() => setPasteTarget("form")}>Paste</Button>
            </div>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={formFile ? [formFile] : []}
              onPreview={handlePreview}
              onChange={handleChangeForm}
              maxCount={1}
              className="pi-upload"
            >
              {!formFile && (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
          </div>
        </Col>

        <Col span={8}>
          <div>
            <div className="flex gap-2 items-center mb-4">
              <h3 className="font-semibold">Ảnh CCCD</h3>
              <Button onClick={() => setPasteTarget("cccd")}>Paste</Button>
            </div>
            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={cccdFile ? [cccdFile] : []}
              onPreview={handlePreview}
              onChange={handleChangeCccd}
              maxCount={1}
              className="pi-upload"
            >
              {!cccdFile && (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
          </div>
        </Col>

        <Col span={8}>
          <div>
            <div className="flex gap-2 items-center mb-4">
              <h3 className="font-semibold">Ảnh khác</h3>
              <Button onClick={() => setPasteTarget("other")}>Paste</Button>
            </div>

            <Upload
              customRequest={handleUpload}
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              className="pi-upload"
              multiple
              maxCount={2}
            >
              {fileList.length > 2 ? null : (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
          </div>
        </Col>
      </Row>

      <Space>
        <Button onClick={handleClearImage} className="mt-4" type="primary" danger>
          Clear ảnh
        </Button>
        <Button
          onClick={handleIdentification}
          className="mt-4"
          type="primary"
          loading={loading}
          disabled={!formFile || !cccdFile || loading}
        >
          RUN
        </Button>
      </Space>

      <Card title="Kết quả xác thực" className="mt-6! shadow-md rounded-xl" bordered>
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Trạng thái">
            {data?.status ? <Tag color={data.status === "OK" ? "green" : "red"}>{data.status}</Tag> : "-"}
          </Descriptions.Item>

          <Descriptions.Item label="Họ và tên">{data?.ho_ten || "-"}</Descriptions.Item>

          <Descriptions.Item label="Số CCCD">{data?.so_cccd || "-"}</Descriptions.Item>

          <Descriptions.Item label="Ngày cấp">{data?.ngay_cap || "-"}</Descriptions.Item>

          <Descriptions.Item label="Nơi cấp">{data?.noi_cap || "-"}</Descriptions.Item>
          <Descriptions.Item label="Email nhận hợp đồng">{data?.email || "-"}</Descriptions.Item>
          <Descriptions.Item label="Nơi cấp">{data?.username || "-"}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Image
        styles={{ root: { display: "none" } }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (v) => setPreviewOpen(v),
        }}
        src={previewImage}
      />

      <Button onClick={handleSaveData} className="mt-4 w-full py-4!" type="primary" disabled={!data}>
        LƯU DATA
      </Button>
    </Card>
  );
}
