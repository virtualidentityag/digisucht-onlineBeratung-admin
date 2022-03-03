import React from "react";
import { Button, Modal, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Title from "antd/es/typography/Title";

import EditableTableProps from "../../types/editabletable";

function EditableTable({
  handleBtnAdd,
  isLoading,
  source,
  columns,
  isDeleteModalVisible,
  handleOnDelete,
  handleDeleteModalCancel,
  handleDeleteModalTitle,
  handleDeleteModalText,

  handlePagination,
  page,
}: EditableTableProps) {
  const { t } = useTranslation();

  return (
    <>
      <Button
        className="mb-m"
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleBtnAdd}
      >
        {t("new")}
      </Button>
      <Table
        loading={isLoading}
        className="editableTable"
        dataSource={source}
        columns={columns}
        scroll={{
          x: "max-content",
          y: "100%",
        }}
        sticky
        tableLayout="fixed"
      />
      <Modal
        title={<Title level={2}>{handleDeleteModalTitle}</Title>}
        visible={isDeleteModalVisible}
        onOk={handleOnDelete}
        onCancel={handleDeleteModalCancel}
        cancelText="ABBRECHEN"
        closable={false}
        centered
      >
        <p>{handleDeleteModalText}</p>
      </Modal>
    </>
  );
}

export default EditableTable;
