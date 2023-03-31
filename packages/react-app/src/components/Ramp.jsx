import { DollarCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import React from "react";

export default function Ramp(props) {
  return (
    <div>
      <Button size="large" shape="round">
        <DollarCircleOutlined style={{ color: "#52c41a" }} />{" "}
        {typeof props.price === "undefined" ? 0 : props.price.toFixed(2)}
      </Button>
    </div>
  );
}
