import {
    Button,
    Space,
} from "antd";
import { DatePicker } from "./Antdesign_dayjs_components";
const { RangePicker } = DatePicker;

export const getDateRangeMenu = (setQuery) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div>
            <RangePicker
                value={selectedKeys}
                onChange={(dates) => setSelectedKeys(dates ? dates : [])}
            />
            <Space>
                <Button
                    type="primary"
                    onClick={() => handleDateRange(confirm, selectedKeys, setQuery)}
                    size="small"
                    style={{ width: 80 }}
                >
                    Set Filter
                </Button>
            </Space>
        </div>
    ),
});

const handleDateRange = (confirm, selectedKeys, setQuery) => {
    setQuery(oldState => ({
        ...oldState,
        start: selectedKeys[0] ?? "",
        end: selectedKeys[1] ?? "",
        page: 1
    }));
    confirm();
};