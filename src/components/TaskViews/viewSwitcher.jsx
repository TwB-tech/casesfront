import React from 'react';
import { Menu, Dropdown, Button } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

const ViewSwitcher = ({ currentView, onViewChange }) => {
  const menu = (
    <Menu onClick={(e) => onViewChange(e.key)}>
      <Menu.Item key="list" icon={<UnorderedListOutlined />}>
        List View
      </Menu.Item>
      <Menu.Item key="board" icon={<AppstoreOutlined />}>
        Board View
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu}>
      <Button>
        Switch View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}{' '}
        <AppstoreOutlined />
      </Button>
    </Dropdown>
  );
};

export default ViewSwitcher;
