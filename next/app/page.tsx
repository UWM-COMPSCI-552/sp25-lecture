'use client';

import { Provider } from "@/components/ui/provider";
import { Button, ChakraProvider, Flex, HStack, Icon, IconButton, Input, List, Text, VStack } from "@chakra-ui/react";
import { MouseEventHandler, useRef, useState } from "react";
import { MdAdd, MdDelete } from "react-icons/md";
// import { DeleteIcon, AddIcon } from "@chakra-ui/icons";

type Task = { id:number, description : string } ;

const DEFAULT_LIST = [{id: 1, description : "CS 552 Homework"}];

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tasks, setTasks] = useState([...DEFAULT_LIST]);
  const deleteItem = (t : Task) => {
    
    // TODO: CODE!
  }
  function makeTaskItem(task:Task) {
    return (
      <List.Item key={task.id}> {task.description} <Flex/> 
        <IconButton variant='subtle' aria-label="Delete" onClick={() => deleteItem(task)} asChild color="red.500">
          <MdDelete/>
        </IconButton> 
      </List.Item>);
  }
  function addNewItem() {
    if (inputRef.current == null) {
      console.log('oops not defined');
    } else {
      const newDesc = inputRef.current.value;
      console.log("Adding", newDesc);
      
      setTasks([...tasks,{description:newDesc, id:Date.now()}]);
      
     /* This doesn't work
     tasks.push({id:Date.now(), description:newDesc});
     setTasks(tasks);
     */
    } 
  }
  return <VStack>
    <Text>TODO List</Text>
    <List.Root>
      {
        tasks.map(  makeTaskItem )
      }
    </List.Root>
    <HStack> <Input ref={inputRef}/>  <IconButton variant='subtle' aria-label="Add new item" onClick={addNewItem}><MdAdd/></IconButton></HStack>
  </VStack>;
}
