import React, { useState } from 'react'
import {View,Text,TextInput,Pressable, StyleSheet, ActivityIndicator,Image, ScrollView, TouchableOpacity, KeyboardAvoidingView} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import { Entypo } from '@expo/vector-icons';
import axios from 'axios'


import {ThemedText, ThemedView} from '../components/Themed'
import { BASEURL } from '../constants/Credentials'
import colors from '../constants/Colors'
import getToken from '../funcs/GetToken';
import { RootStackScreenProps } from '../types';


export default function EditProfileScreen({route}: RootStackScreenProps<'Edit'>) {
  const {picture: img, bio: bi, prevName} = route.params
  const [image, setImage] = useState(img)
  const [name,setName] = useState(prevName)
  const [bio,setBio] = useState(bi)
  const [picture,setPicture] = useState<string| null>(null)
  const [nameError, setNameError] = useState("")
  const [bioError, setBioError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleName = (text: string) => {
    if(text.match(/\W/)) return setNameError("Only english characters allowed")
    setNameError("")
    setName(text)
  }
  const handleBio = (text: string) => {
     if(text.length > 126) {
       setBioError("Can not be longer than 126 characters")
       return
     }
     setBioError("")
     setBio(text)
  }

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({type:'image/*'});
      if(res.type === "success"){
        setPicture(JSON.stringify(res));
        setImage(res.uri)
      }

    } catch (err) {
        setPicture(null);

    }
  };

  const save = async () => {
    if(bioError !== "" || nameError !== "" || loading || name === "") return
    const formData = new FormData()
    formData.append("name",name);
    formData.append("bio",bio);
    if(picture !== null) {
     formData.append("picture",picture)
    }
    formData.append('prevName',prevName)
    setLoading(true)
    const token = await getToken()
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    axios.post(`${BASEURL}profile/edit-profile/`,formData,config)
    .then(res => {
       console.log(res.data)
       setLoading(false)
    })
    .catch(err => {
      console.log(err)
      setLoading(false)
    })
  }
  return (
    <ThemedView style = {{flex:1}}>
    <ScrollView contentContainerStyle= {{flex:1,paddingBottom: 20}}>
    <Image style = {styles.image} source = {{uri: image}} />
    <TouchableOpacity
       style = {styles.editIcon}
       activeOpacity={0.5}
       onPress={selectFile}>
       <Text><Entypo name="edit" size={24} color= {colors.mainColor} /></Text>
     </TouchableOpacity>
    <View style = {styles.inputContainer}>
    <ThemedText style = {styles.label}>User name</ThemedText>
    <TextInput
     style = {styles.input}
     placeholder = "User name"
     onChangeText = {handleName}
     value = {name}
    />
    <Text style = {styles.error}>{nameError ? nameError : ' '}</Text>
    </View>
    <KeyboardAvoidingView>
    <View style = {styles.inputContainer}>
    <ThemedText style = {styles.label}>Bio</ThemedText>
    <TextInput
    style = {[styles.input,{height: 80}]}
    placeholder = "Bio"
    onChangeText = {handleBio}
    multiline
    value = {bio}
    />
    <Text style = {styles.error}>{bioError ? bioError : ' '}</Text>
    </View>
    </KeyboardAvoidingView>
    <Pressable
    style = {({pressed}) => [styles.button, {opacity: pressed ? 0.7 : 1}]}
    onPress = {save}>
    {loading ? <ActivityIndicator color = "white" size = "small"/>
                   :
      <Text style = {{color: 'white'}}>Save</Text>
    }
    </Pressable>
    </ScrollView>
    </ThemedView>
  )
}



const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '50%',
    marginBottom: 20
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  editIcon: {
   position: 'absolute',
   top: '50%',
   right: 10,
   padding: 7,
   marginTop: -45,
  },
  button: {
    width: 60,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 20,
    alignSelf: "flex-end",
    backgroundColor: colors.mainColor,
  },
  inputContainer: {
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 3
  },
  input : {
    borderWidth: 1,
    borderColor: colors.mainColor,
    paddingHorizontal:10,
    paddingVertical: 7
  },
  error: {
    color:'red'
  }
})