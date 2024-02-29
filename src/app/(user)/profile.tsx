import {  Text, View } from 'react-native'
import React from 'react'
import { supabase } from '@/lib/supabase'
import Button from '@/components/Button'

const ProfileScreen = () => {
  return (
    <View>
      <Text>Click to Sign out</Text>

      <Button text="Sign out" onPress={async()=>await supabase.auth.signOut()}/>


    </View>
  )
}

export default ProfileScreen

