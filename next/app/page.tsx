import { Provider } from "@/components/ui/provider";
import { ChakraProvider, HStack, Icon, Input, List, Text, VStack } from "@chakra-ui/react";
import { MdAdd, MdDelete } from "react-icons/md";
// import { DeleteIcon, AddIcon } from "@chakra-ui/icons";

export const metadata = {
  title: "App Router",
};

export default function Page() {
  return <VStack>
    <Text>TODO List</Text>
    <List.Root>
      <List.Item>
        <List.Indicator asChild color="red.500"><MdDelete/></List.Indicator>
        Wash dishes
      </List.Item>
      <List.Item>
      <List.Indicator asChild color="red.500">
        <MdDelete />
      </List.Indicator>
      Do CS 552 homework #4
      </List.Item>
    </List.Root>
    <HStack> <Input id="newitemid"/>  <Icon> <MdAdd/> </Icon></HStack>
  </VStack>;
}
