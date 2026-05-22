/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, Col, Row } from "antd";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";

export default function Storage() {
  const [files, setFiles] = useState<any>([]);

  useEffect(() => {
    async function getFiles() {
      const { data } = await supabase.storage.from("DataImageSave").list("", {
        limit: 100,
        offset: 0,
      });

      setFiles(data ?? []);
    }

    getFiles();
  }, []);

  return (
    <Card title="Storage" bordered={false} className="w-full h-[calc(100vh-120px)] overflow-auto">
      <Row gutter={[16, 16]}>
        {files.map((file: any) => (
          <Col span={8}>
            <div className="border border-red-300! shadow rounded-xl p-1">
              <img
                key={file.name}
                src={
                  import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/DataImageSave/" + file.name
                }
                alt={file.name}
                className="rounded-xl"
              />
              <span className="block text-center mt-2">
                {file.updated_at ? new Date(file.updated_at).toLocaleString("vi-VN") : ""}
              </span>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
