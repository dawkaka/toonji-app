import React,{useState, useEffect, useContext} from 'react'
import {View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator} from 'react-native'
import { FontAwesome, MaterialIcons, FontAwesome5, AntDesign, Ionicons } from '@expo/vector-icons';
import axios from 'axios'

import {ThemedText, ThemedView} from './Themed'
import {BASEURL} from '../constants/Credentials'
import CardIcon from './LyricsIcons'
import layout from '../constants/Layout'
import colors from '../constants/Colors'
import Breakdown from './Breakdown'
import getToken from '../funcs/GetToken';
import {AuthContext} from '../navigation/index'
import { awardReq } from '../types';

const mainColor = colors.mainColor

type bar = {
  indx: string; punchline:string; userFav: boolean;
  hasIcons: boolean; songId:string;rated: boolean; rating: string;
 _id: string; artist: string; enabled: boolean;
 showModal: (dd:awardReq) => void;
 showEditModal: (dd:{br: string; punchId: string; songId: string; id: string}) => void
}

export default function Bar({indx, punchline,userFav, hasIcons, rated,
                           rating, artist, _id, enabled,
                           songId, showModal, showEditModal}: bar) {
  const [isFavorite, setIsFavorite] = useState(userFav)
  const [hasFire, setHasFire] = useState(rated)
  const [fires, setFires] = useState(parseInt(rating))
  const [showBreakdowns, setShowBreakdowns] = useState(false)
  const [show, setShow] = useState(enabled)
  const [brDowns, setBrDowns] = useState<unknown[]>([])
  const [br, setBr] = useState("")
  const [inputHeight, setInputHeight] = useState(40)
  const [sending, setSending] = useState(false)

  const {signOut} = useContext(AuthContext)

   useEffect(()=> {
     setShow(enabled)
   },[enabled])

  const getBreakdowns = () => {
    setShowBreakdowns(!showBreakdowns)
  axios.get(`${BASEURL}breakdowns/${songId}/${indx}`)
   .then(res => {
     if(res.data.type === "ERROR"){

    }else {
      setBrDowns([])
      setBrDowns(res.data)
    }
   })
   .catch(er => {
    console.log(er)
   })
}

const handleTextChange = (text:string) => {
  setBr(text)
}

const addBarToFavourites = async () => {
     setIsFavorite(!isFavorite)
     const token = await getToken()
     const config = {
       headers: {
         Authorization: `Bearer ${token}`
       }
     }
     axios.post(`${BASEURL}bar-favourited/${songId}/${_id}`,{}, config)
     .then(res => {
      const data = res.data
      if(data.type === 'ERROR' && data.msg === "invalid or expired token") {
        signOut()
      }
     })
     .catch(err => {
       console.log(err)
     })
  }

 const firePressed = async () => {
   if(!hasFire){
     setFires(fires + 1)
     setHasFire(true)
   }else {
     setFires(prev => prev - 1)
     setHasFire(false)
   }
   const token = await getToken()
   const config = {
     headers: {
       Authorization: `Bearer ${token}`
     }
   }
    axios.post(`${BASEURL}lyrics/fire/${songId}/${indx}`,{},config)
      .then(res =>{
       const data = res.data
       if(data.type === 'ERROR' && data.msg === "invalid or expired token") {
         signOut()
       }
    })
     .catch((err)=>{
      console.log(err)
    })
 }


 const sendBreakdown = async () => {
     if(br.trim() === '') return
     setSending(true)
     const token = await getToken()
     const config = {
       headers: {
         Authorization: `Bearer ${token}`
       }
     }
     axios.post(BASEURL + 'breakdown/'+songId+"/"+indx,{breakdown: br.trim()},config)
     .then((res)=>{
       let message = res.data.msg
       if(res.data.type === "SUCCESS"){
        axios.get(`${BASEURL}breakdowns/${songId}/${indx}`)
        .then(res => {
          setBr('')
          if(res.data.type !== 'ERROR') {
            setBrDowns([])
            setBrDowns(res.data)
            setSending(false)
          }
        })
        .catch(er => {
          console.log(er)
        })
     }
      if(res.data.type === "ERROR"){
      if(message === "invalid or expired token") {
        signOut()
      }
   }
   })
    .catch((err)=>{
      console.log(err)
      setSending(false)
   })
   }

   const deleteBreakdown = ({punchId, id}:{punchId:string;id:string}) => {
     axios.post(`${BASEURL}delete/breakdown/${songId}/${punchId}/${id}`)
     .then(res => {
       console.log(res)
     })
     .catch(err => {
       console.log(err)
     })
   }

  if(!hasIcons) punchline = punchline.substr(0,punchline.length - 3)
  return (
    <ThemedView style = {styles.container} >
    <Pressable onPress = {()=>setShow(!show)}>
    <ThemedText style = {styles.bar}>
    {punchline}
    </ThemedText>
    </Pressable>
    {(hasIcons && show ) && <View style = {styles.iconsContainer}>
    <Pressable>
    <CardIcon icon = {<FontAwesome size={18}
                     name = "copy"  color = {mainColor}/>}/>
    </Pressable>

    <Pressable onPress = {getBreakdowns}>
    <CardIcon icon = {<FontAwesome5 name="lightbulb" size={18} color= {showBreakdowns ? mainColor : "lightgray"}/>}/>
    </Pressable>

    <Pressable onPress = {addBarToFavourites}>
    <CardIcon icon = {<AntDesign size={18}  name = "heart" color = {isFavorite ? mainColor : "lightgray"}/>}/>
    </Pressable>

    <Pressable onPress = {firePressed}>
    <CardIcon icon = {<MaterialIcons size={20} name = "local-fire-department"
    color = {hasFire ? mainColor : "lightgray"}/>} number = {<ThemedText>{fires}</ThemedText>}/>
    </Pressable>
    </View>
  }
  {showBreakdowns && <View style = {styles.breakdownsContainer}>
    <ScrollView nestedScrollEnabled = {true} contentContainerStyle = {{  paddingHorizontal: 10,
      paddingTop: 10,}}>
      <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style = {{
        width: '100%',
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        marginBottom: 20
       }}
      >
      <TextInput
        style={[styles.input,{height: inputHeight}]}
        placeholder="write breakdown"
        onChangeText= {handleTextChange}
        onContentSizeChange={(event) => {
             setInputHeight(event.nativeEvent.contentSize.height)
         }}
        value={br}
        multiline
      />
      <Pressable
      style = {({pressed}) => [styles.button,{opacity: br.length ? !pressed ? 1 : 0.7 : 0.7}]}
      onPress = {sendBreakdown}
      >

      {sending ? <ActivityIndicator size = "small" color = 'white' /> :
                   <Ionicons name="send-sharp" size={22} color="white" />}
      </Pressable>
      </KeyboardAvoidingView>

    {brDowns.map((br,i) => {
      return <Breakdown key = {i} {...br} songId = {songId}  showModal = {showModal}
      punchId = {indx} indx = {`${i}`} showEditModal = {showEditModal} deleteBreakdown = {deleteBreakdown}/>
    })}
   </ScrollView>
   </View>
 }
    </ThemedView>
  )
}


const styles = StyleSheet.create({
  container: {
    width: layout.isSmallDevice ? 95/ 100 * layout.window.width : 85 / 100 * layout.window.width,
  },
  bar: {
    fontSize: 15
  },
  iconsContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  breakdownsContainer: {
    borderRadius: 5,
    height: 50 / 100 * layout.window.height,
    backgroundColor: colors.lightgray,
  },
  input : {
     width: '100%',
     borderWidth: 1,
     borderColor: colors.mainColor,
     padding: 10,
     marginBottom: 5
   },
   button: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: colors.mainColor,
    marginBottom: 7,
  },
})
