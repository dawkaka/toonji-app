import React, { useContext,  useState } from 'react'
import {View, StyleSheet, Pressable} from 'react-native'
import {FontAwesome} from '@expo/vector-icons';

import {ThemedText, ThemedView} from './Themed'
import { UserInfo} from './General'
import Award from './Award'
import { BASEURL } from '../constants/Credentials';
import { AuthContext } from '../navigation/context'

import axios from 'axios';
import { brType } from '../types';
import { NotifyContext } from './Notify';

export default function Breakdown(props: brType ) {

  const {name, points, songId, breakdown, date, indx,
         brAwards, punchId, id, isThisUser,
         showModal, showEditModal, deleteBreakdown} = props

  const [totalVotes, setTotalVotes] = useState(props.totalVotes)
  const [userVote, setUserVote] = useState(props.userVote)
  const {signOut} = useContext(AuthContext)
  const {newNotification} = useContext(NotifyContext)

  const handleVote = async (vote : 'UPVOTE' | 'DOWNVOTE') => {
  axios.post(`${BASEURL}breakdown-vote/${songId}/${punchId}/${id}/${vote}`)
       .then((res)=>{
         let hasVoted = userVote ? true: false
           setUserVote(vote)
           if(vote === 'UPVOTE') {
             hasVoted ? setTotalVotes(totalVotes + 2):setTotalVotes(totalVotes + 1)
           }else {
             hasVoted ? setTotalVotes(totalVotes - 2):setTotalVotes(totalVotes - 1)
           }
           newNotification(res.data.msg,'SUCCESS')
     })
      .catch((err)=>{
        let msg = err.response?.data.msg
        if(err.response?.status === 401){signOut()}else{newNotification(msg,'ERROR')}
      })
     }

   return (
     <ThemedView style = {styles.breakdownContainer}>
     <UserInfo name = {name} points = {points} date = {date} picture = {props.picture}
     options = {{data:{id, indx, songId},
                 list: isThisUser ?
                  [{name: "Delete", func : () => deleteBreakdown({punchId, id}) },
                  {name:"Edit", func: () => showEditModal({br: breakdown,songId, punchId, id})}] :
                  [{name:"Award",func: () =>showModal({type: "breakdown", songId, breakdown: {punchId, brId: id} })}]}} />
     <View style = {[styles.breakdownInnerContainer]}>
     <View style = {styles.breakdownText}>
     <View style = {styles.awardsContainer}>
     <Award awards = {brAwards}/>
     </View>

     <ThemedText>
     {breakdown}
     </ThemedText>
     </View>

     <View style = {styles.iconsContainer}>
     <Pressable
     style = {({pressed})=> [{opacity: pressed ? 0.7 : 1}]}
     onPress = {() => handleVote('UPVOTE')}
     >
     <FontAwesome name= "angle-up" size = {30} color = {userVote === 'UPVOTE' ? "green": 'lightgray'} />
     </Pressable>
     <ThemedText >
     {totalVotes}
     </ThemedText>
     <Pressable
     style = {({pressed})=> [{opacity: pressed ? 0.7 : 1}]}
     onPress = {() => handleVote('DOWNVOTE')}
     >
      <FontAwesome name= "angle-down" size = {30} color = {userVote === 'DOWNVOTE'? 'red': "lightgray"} />
     </Pressable>
     </View>

     </View>
     </ThemedView>

   )
}



const styles = StyleSheet.create({
  breakdownContainer: {
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 5
  },
  awardsContainer: {
     flexDirection: 'row',
     marginBottom: 5
  },
  breakdownText: {
    flexBasis: '90%'
  },
   breakdownInnerContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: 10,
     width: '90%'
   },
   iconsContainer: {
     justifyContent: 'center',
     alignItems: 'center',
     marginLeft: 10,
     paddingLeft:10,
     borderLeftWidth: 2,
     borderLeftColor: 'lightgray'
   }
})
