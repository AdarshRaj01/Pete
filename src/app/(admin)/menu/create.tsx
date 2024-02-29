import { StyleSheet, Text, TextInput, View, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import Button from '@/components/Button'
import { defaultPizzaImage } from '@/components/ProductListItem'
import Colors from '@/constants/Colors'
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useDeleteProduct, useInsertProduct, useProduct, useUpdateProduct } from '@/api/products'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as FileSystem from 'expo-file-system'
import { randomUUID } from 'expo-crypto'
import { decode } from 'base64-arraybuffer'




const CreateProductScreen = () => {

    const [image, setImage] = useState<string | null>(null);

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [errors, setErrors] = useState('')

    const { id: idString } = useLocalSearchParams();
    const id = parseFloat(typeof idString === 'string'? idString: idString?.[0])
  

    const isUpdating = !!id

    const { mutate:insertProduct } = useInsertProduct()
    const { mutate:updateProduct } = useUpdateProduct()
    const {mutate:deleteProduct} = useDeleteProduct()


    const {data:updatingProduct} = useProduct(id)

    //console.log('++++updatingProduct++++',updatingProduct)



    const router = useRouter()

    useEffect(()=>{
        if(updatingProduct){
            setName(updatingProduct.name)
            setPrice(updatingProduct.price.toString())
            setImage(updatingProduct.image)
        }

    },[updatingProduct])


    const resetFields = () =>{
        setName('');
        setPrice('');
    };

    const validateInput = () => {
        setErrors('')

        if(!name){
            setErrors('Name is required')
            return false
        }
        if(!price){
            setErrors('Price is required')
            return false
        }
        if(isNaN(parseFloat(price))){
            setErrors('Price is not a number')
            return false
        }

        return true
    }

    const onSubmit = () => {
        if(isUpdating)
        {
            //update
            onUpdate();

        }
        else{
            onCreate();
        }
    }


    const onCreate = async() => {
        if(!validateInput()){
            return;
        }

        //console.warn('Creating product: ',name)

        //save in the database
        const imagePath = await uploadImage()
        insertProduct({name, price:parseFloat(price), image:imagePath},{
            onSuccess: () => {
                resetFields();
                router.back();
            }
        })

    }

    const onUpdate = async () => {
        if(!validateInput()){
            return;
        }

        const imagePath = await uploadImage()


        updateProduct({id,name,price:parseFloat(price),image:imagePath},{
            onSuccess: () => {
                resetFields();
                router.back();
            }
        });


        resetFields();
    }

    const onDelete = () => { 
        deleteProduct(id,{
            onSuccess: () => {
                resetFields();
                router.replace('/(admin)');
            }
        })
    }

    const confirmDelete = () =>{
        Alert.alert('Confirm','Are you sure you want to delete this product',[
            {
                text:'Cancel',
            },
            {
                text:'Delete',
                style:'destructive',
                onPress:onDelete
            },
        ]);
    }

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
    
    
        if (!result.canceled) {
          setImage(result.assets[0].uri);
        }
      };

    const uploadImage = async () => {
        if (!image?.startsWith('file://')) {
          return;
        }
      
        const base64 = await FileSystem.readAsStringAsync(image, {
          encoding: 'base64',
        });
        const filePath = `${randomUUID()}.png`;
        const contentType = 'image/png';
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, decode(base64), { contentType });
      
        if (data) {
          return data.path;
        }
      };



    

  return (
    <View style={styles.container}>
        <Stack.Screen options={{title:(isUpdating?'Update Product':'Create Product')}} />
        <Image  source={{uri: image || defaultPizzaImage}} style={styles.image}/>
        <Text onPress={pickImage} style={styles.textButtton}>Select Image</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput 
        value={name}
        onChangeText={setName}
        placeholder='Name' style={styles.input}/>

      <Text style={styles.label}>Price </Text>
      <TextInput 
        value={price}
        onChangeText={setPrice}
        placeholder='99' style={styles.input} keyboardType='numeric' />

      <Text style={{color:'red'}}>{errors}</Text>  

      <Button text={isUpdating?"Update":"Create"} onPress={onSubmit}/>
      {isUpdating && (<Text onPress={confirmDelete} style={styles.textButtton}>Delete</Text>)}
    </View>
  )
}

export default CreateProductScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        padding:10,

    },
    label:{
        color:'gray',
        fontSize:16,
    },
    input:{
        backgroundColor:'white',
        padding:10,
        borderRadius:5,
        marginTop:5,
        marginBottom:20,
    },

    image:{
        width:'50%',
        aspectRatio:1,
        alignSelf:'center',

    },
    textButtton:{
        alignSelf:'center',
        fontWeight:'bold',
        color: Colors.light.tint,
        marginVertical:10
    }
})