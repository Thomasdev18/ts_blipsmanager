import React, { useState } from "react";
import {
  DEFAULT_THEME,
  Divider,
  Paper,
  Text,
  Group,
  Switch,
  ScrollArea,
  Accordion,
  TextInput,
  ThemeIcon,
} from "@mantine/core";
import { IconMap, IconSearch } from "@tabler/icons-react";
import { fetchNui } from "../utils/fetchNui";
import { useNuiEvent } from "../hooks/useNuiEvent";

interface Blip {
  id: string;
  label: string;
  enabled: boolean;
}

interface BlipCategory {
  label: string;
  id: string;
  enabled: boolean;
  blips: Blip[];
}

const Menu: React.FC = () => {
  const theme = DEFAULT_THEME;
  const [categories, setCategories] = useState<BlipCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useNuiEvent<any>("blipsMenu", (data) => {
    const blipData = Object.values(data) as BlipCategory[];
    setCategories(blipData);
  });

  const handleCategoryChange = (id: string, enabled: boolean) => {
    fetchNui("blipVisibility", { enable: enabled, id: id });

    setCategories(
      categories.map((category) =>
        category.id === id
          ? {
              ...category,
              enabled,
              blips: category.blips.map((blip) => ({
                ...blip,
                enabled: enabled ? true : false,
              })),
            }
          : category
      )
    );
  };

  const handleBlipChange = (
    categoryId: string,
    blipId: string,
    enabled: boolean
  ) => {
    fetchNui("blipVisibility", { enable: enabled, id: blipId });

    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          const updatedBlips = category.blips.map((blip) =>
            blip.id === blipId ? { ...blip, enabled } : blip
          );
          return { ...category, blips: updatedBlips };
        }
        return category;
      })
    );
  };

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      blips: category.blips.filter((blip) =>
        blip.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.blips.length > 0);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Paper
        w={350}
        h={600}
        withBorder
        radius="sm"
        style={{ margin: 15, backgroundColor: theme.colors.dark[8] }}
      >
        <Group style={{ padding: 5, justifyContent: "space-between" }}>
          <Text size="xl" fw={700}>
            Blips
          </Text>
          <ThemeIcon variant="dark" color="blue" radius="xs" size="lg">
            <IconMap size={25} stroke={1.5} />
          </ThemeIcon>
        </Group>
        <Divider />
        <TextInput
          placeholder="Search blips..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          icon={<IconSearch size={16} stroke={1.5} />}
          style={{ padding: 5, marginBottom: 10 }}
        />
        <ScrollArea
          scrollbarSize={2}
          scrollHideDelay={0}
          h={500}
          style={{ padding: 5 }}
        >
          <Accordion defaultValue="">
            {filteredCategories.map(({ label, id, enabled, blips }) => (
              <Accordion.Item key={id} value={id}>
                <Accordion.Control>
                  <Group
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text size="sm">{label}</Text>
                    <Switch
                      size="xs"
                      color="blue"
                      radius="xs"
                      checked={enabled}
                      onChange={(event) =>
                        handleCategoryChange(id, event.currentTarget.checked)
                      }
                    />
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  {blips.map(({ label, id: blipId, enabled: blipEnabled }) => (
                    <Group
                      key={blipId}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: 5,
                        backgroundColor: theme.colors.dark[7],
                        borderRadius: theme.radius.sm,
                        marginBottom: 5,
                      }}
                    >
                      <Text size="sm">{label}</Text>
                      <Switch
                        size="xs"
                        color="blue"
                        radius="xs"
                        checked={blipEnabled}
                        onChange={(event) =>
                          handleBlipChange(id, blipId, event.currentTarget.checked)
                        }
                        disabled={enabled}
                      />
                    </Group>
                  ))}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </ScrollArea>
      </Paper>
    </div>
  );
};

export default Menu;
