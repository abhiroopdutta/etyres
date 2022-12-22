import {
    Select,
} from "antd"; const { Option } = Select;


export const getDropDownMenu = ({ dataIndex, multiple = false, defaultValue, options, setQuery }) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
            <Select
                mode={multiple ? "multiple" : null}
                defaultValue={defaultValue}
                style={{ width: 120 }}
                onChange={(value) =>
                    handleDropDownMenuChange(dataIndex, confirm, value, setQuery, multiple)
                }
                onBlur={confirm}
            >
                {options.map(option =>
                    <Option
                        key={option.value}
                        value={option.value}>
                        {option.label}
                    </Option>)}
            </Select>
        </div>
    ),
    filtered: true,
});

const handleDropDownMenuChange = (dataIndex, confirm, value, setQuery, multiple) => {
    setQuery(oldState => ({
        ...oldState,
        [dataIndex]: value,
        page: 1
    }));

    if (!multiple) {
        confirm();
    }
};