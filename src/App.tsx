import { Box, Button } from "@mui/material";
import { Dropdown, DropdownItem } from "./components/dropdown";

const App = () => {
  // Define the dropdown items
  const items: DropdownItem<string>[] = [
    {
      label: "Item 1",
      value: "item1",
      onSelect: () => alert("Item 1 selected"),
    },
    {
      label: "Item 2",
      value: "item2",
      onSelect: () => alert("Item 2 selected"),
      items: [
        {
          label: "Subitem 1",
          value: "subitem1",
          onSelect: () => alert("Subitem 1 selected"),
          items: [
            {
              label: "Sub-subitem 1",
              value: "subsubitem1",
              onSelect: () => alert("Sub-subitem 1 selected"),
              items: [
                {
                  label: "Sub-subitem 1",
                  value: "subsubitem1",
                  onSelect: () => alert("Sub-subitem 1 selected"),
                },
              ],
            },
          ],
        },
        {
          label: "Subitem 2",
          value: "subitem2",
          onSelect: () => alert("Subitem 2 selected"),
        },
      ],
    },
    {
      label: "Item 3",
      value: "item3",
      onSelect: () => alert("Item 3 selected"),
      items: [
        {
          label: "Item 2",
          value: "item2",
          onSelect: () => alert("Item 2 selected"),
          items: [
            {
              label: "Subitem 1",
              value: "subitem1",
              onSelect: () => alert("Subitem 1 selected"),
              items: [
                {
                  label: "Sub-subitem 1",
                  value: "subsubitem1",
                  onSelect: () => alert("Sub-subitem 1 selected"),
                  items: [
                    {
                      label: "Sub-subitem 1",
                      value: "subsubitem1",
                      onSelect: () => alert("Sub-subitem 1 selected"),
                    },
                  ],
                },
              ],
            },
            {
              label: "Subitem 2",
              value: "subitem2",
              onSelect: () => alert("Subitem 2 selected"),
            },
          ],
        },
      ],
      disabled: true,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Dropdown
        items={items}
        containerWidth={200}
        onSelect={(value, option) =>
          console.log(`Selected ${value} - ${option.label}`)
        }
        closeOnScroll={true}
      >
        {({ onClick, isOpen }) => (
          <Button variant="contained" onClick={onClick}>
            {isOpen ? "Close Dropdown" : "Open Dropdown"}
          </Button>
        )}
      </Dropdown>
    </Box>
  );
};

export default App;
