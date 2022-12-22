import {
    Input,
    Button,
    Space,
} from "antd";
import {
    SearchOutlined,
} from "@ant-design/icons";
export const getSearchMenu = (dataIndex, searchInputRef, setQuery) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
            <Input
                ref={searchInputRef}
                placeholder={`Search ${dataIndex}`}
                value={selectedKeys[0]}
                onChange={(e) =>
                    setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex, setQuery)}
                style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => handleSearch(selectedKeys, confirm, dataIndex, setQuery)}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                >
                    Set Filter
                </Button>
            </Space>
        </div>
    ),
    onFilterDropdownVisibleChange: (visible) => {
        if (visible) {
            setTimeout(() => searchInputRef.current.select(), 100);
        }
    },
});
const handleSearch = (selectedKeys, confirm, dataIndex, setQuery) => {
    setQuery(oldState => ({
        ...oldState,
        [dataIndex]: selectedKeys[0] ?? "",
        page: 1
    }));
    confirm();
};