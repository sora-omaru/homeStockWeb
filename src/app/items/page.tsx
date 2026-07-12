"use client"

import { getItems } from "@/lib/api/item"
import { ItemResponse } from "@/types/item"
import { useEffect, useState } from "react"

export default function ItemsPage(){
const [items,setItems] = useState<ItemResponse[]>([])
const [isLoading,setIsLoading] = useState(true)
const [errorMessage,setErrorMesage] = useState<string|null>(null)

useEffect(()=>{
    async function fetchItems(){
        try{
            const response = await getItems();
            setItems(response)
        }catch(error){
            console.error(error)
            setErrorMesage("Item一覧の取得に失敗しました")
        }finally{
            setIsLoading(false)
        }
    }
    fetchItems()
},[])


  if (isLoading) {
    return <main>読み込み中です...</main>;
  }

  if (errorMessage) {
    return <main>{errorMessage}</main>;
  }

return (
    <main>
        <h1>Item一覧</h1>
         <pre>{JSON.stringify(items, null, 2)}</pre>
    </main>
)
}