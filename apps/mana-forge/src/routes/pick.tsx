import {
  Alert,
  Button,
  List,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import type { FC } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePickStore } from "../stores/pick.store.ts";

export const PickPage: FC = () => {
  const { wishlistText, setCodesText, isLoading, error, recommendations } =
    usePickStore(
      useShallow((state) => ({
        wishlistText: state.wishlistText,
        setCodesText: state.setCodesText,
        isLoading: state.isLoading,
        error: state.error,
        recommendations: state.recommendations,
      })),
    );

  return (
    <Stack gap="md">
      <Title order={2}>Pick Boosters</Title>
      <Text>
        Compare your wishlist against selected sets and buy boosters from the
        set with the most wanted cards. This first version scores every wanted
        card equally.
      </Text>

      <Textarea
        label="Wishlist"
        description="Enter one exact card name per line."
        placeholder={"Sheoldred, the Apocalypse\nLiliana of the Veil"}
        minRows={6}
        value={wishlistText}
        onChange={(event) =>
          usePickStore.getState().setWishlistText(event.currentTarget.value)
        }
      />

      <Textarea
        label="Sets to compare"
        description="Enter one Scryfall set code per line, such as dmu or inn."
        placeholder={"dmu\nmid"}
        minRows={4}
        value={setCodesText}
        onChange={(event) =>
          usePickStore.getState().setSetCodesText(event.currentTarget.value)
        }
      />

      <Button
        onClick={() => usePickStore.getState().recommend()}
        loading={isLoading}
      >
        Find the best boosters
      </Button>

      {error ? <Alert color="red">{error}</Alert> : null}

      {recommendations.length > 0 ? (
        <Table
          striped
          highlightOnHover
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Set</Table.Th>
              <Table.Th>Wishlist overlap</Table.Th>
              <Table.Th>Matching cards</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recommendations.map((recommendation) => (
              <Table.Tr key={recommendation.setCode}>
                <Table.Td>
                  {recommendation.setName} (
                  {recommendation.setCode.toUpperCase()})
                </Table.Td>
                <Table.Td>{recommendation.overlap.toFixed(1)}%</Table.Td>
                <Table.Td>
                  {recommendation.matchedCardNames.length > 0 ? (
                    <List size="sm">
                      {recommendation.matchedCardNames.map((name) => (
                        <List.Item key={name}>{name}</List.Item>
                      ))}
                    </List>
                  ) : (
                    "None"
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : null}

      <Paper
        withBorder
        p="md"
      >
        <Text size="sm">
          Results reflect cards printed in each set, not rarity, booster
          contents, prices, or special-slot collation.
        </Text>
      </Paper>
    </Stack>
  );
};

export default PickPage;
