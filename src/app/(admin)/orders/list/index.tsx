import { FlatList, View , Text, ActivityIndicator} from 'react-native';
import OrderListItem from '@/components/OrderListItem';
import { useAdminOrderList } from '@/api/orders';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInsertOrderSubscription } from '@/api/orders/subscriptions';




export default function OrdersScreen() {
  const {data:orders, isLoading, error} = useAdminOrderList({archived:false})//({archived:false})

  useInsertOrderSubscription()


  const queryClient = useQueryClient()
  useEffect(() => {
    const ordersSubscription = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Change received!', payload);
          queryClient.invalidateQueries({queryKey:['orders']})
          //refetch();
        }
      )
      .subscribe();
    return () => {
      ordersSubscription.unsubscribe();
    };
  }, []);


  if(isLoading){
    return <ActivityIndicator />

  }
  if(error)
  {
    return <Text>Failed to fetch</Text>
  }


  return (
    <FlatList
      data={orders}
      renderItem={({item})=> <OrderListItem order={item}/>}
      contentContainerStyle={{gap:10, padding:10}}

    
    />
  )
  
}

