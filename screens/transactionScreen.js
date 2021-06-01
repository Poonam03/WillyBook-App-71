import React,{Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput,KeyboardAvoidingView, Alert,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from "../config"
import firebase from 'firebase'
import { askAsync } from 'expo-permissions';

export default class TransactionScreen extends Component{
  constructor(){
    super();
    this.state={
      hasCameraPermission:null,
      scanned:false,
      scannedData:"",
      buttonState:"normal", // to tell that whether the scan button has been clicked or not
      scannedBookId:"",
      scannedStudentId:"",
      transactionMessage:"",
      transactionType:""
    }
  }
  getCameraPermission= async(Id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission:status==='granted',
      scanned: false,
      buttonState:Id
    })
  }
  handleBarCodeScanned=({data})=>{
    if(this.state.buttonState==="BookId"){
    this.setState({
      scannedBookId:data,
      scanned: true, // the scanned data is recieved than need to set status true for scanned and get the button back to normal
      buttonState:"normal"
    })
  }
  else if(this.state.buttonState==="StudentId"){
    this.setState({
      scannedStudentId:data,
      scanned: true, // the scanned data is recieved than need to set status true for scanned and get the button back to normal
      buttonState:"normal"
    })
  }
  }
 handleTransaction=()=>{
    var transactionMessage=null
    db.collection("books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
      var book=doc.data()
      if(book.bookAvail){
        this.initiateBookIssue();
        transactionMessage= "Book Issued"
         ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
      else{
        this.initiateBookReturn();
        transactionMessage= "Book Returned" 
         ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
      }
      console.log(doc.data())
    })
    this.setState({
      transactionMessage:transactionMessage
    })
  }
  initiateBookIssue=async() => {
    var date= await firebase.firestore.Timestamp.now().toDate()
    //add transaction
    db.collection("transaction").add({
      studentId:this.state.scannedStudentId,
      bookId:this.state.scannedBookId,
      date: date,
      transactionType: "Issue"
    })
    //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvail:false
    })
    //change no of book issued to student
    db.collection("students").doc(this.state.scannedStudentId).update({
      noOfBookIssued:firebase.firestore.FieldValue.increment(1)
    })
    alert("Book Issued")
    this.setState({
      scannedBookId:"",
      scannedStudentId:""
    })
  }
  initiateBookReturn=async() => {
    var date= await firebase.firestore.Timestamp.now().toDate()
    //add transaction
    db.collection("transaction").add({
      studentId:this.state.scannedStudentId,
      bookId:this.state.scannedBookId,
      date: date,
      transactionType: "Return"
    })
    //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvail:true
    })
    //change no of book issued to student
    db.collection("students").doc(this.state.scannedStudentId).update({
      noOfBookIssued:firebase.firestore.FieldValue.increment(-1)
    })
    alert("Book Returned")
    this.setState({
      scannedBookId:"",
      scannedStudentId:""
    })
  }
  render()
  {
    if(this.state.buttonState!=="normal" && this.state.hasCameraPermission)
    {
      return(
        // the handlebarCodeScanned function should be called only when scanned status is false
        <BarCodeScanner
          onBarCodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned  }
        />
      )
    }
    else if(this.state.buttonState==="normal"){
      return(
      
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <Image source={require("../assets/booklogo.jpg")} style={{width:150,height:150}}/>

          <Text style={{alignSelf:"center"}}>Willy App</Text>

          <View style={styles.InputView}>
            <TextInput 
            style={styles.InputBox} 
            placeholder = 'BookId' 
            value={this.state.scannedBookId}
            onChangeText={text=> {this.setState({scannedBookId:text})}}/>
          <TouchableOpacity 
          style={styles.scannedButton}
           onPress={()=>{this.getCameraPermission("BookId")}}>
          <Text style={styles.displayText}>SCAN </Text>
          </TouchableOpacity>
          </View>

          <View style={styles.InputView}>
            <TextInput
             style={styles.InputBox} 
             placeholder = 'StudentId' 
             value={this.state.scannedStudentId}
             onChangeText={text=> {this.setState({scannedStudentId:text})}}/>
          <TouchableOpacity 
          style={styles.scannedButton} 
          onPress={()=>{this.getCameraPermission("StudentId")}}>
          <Text style={styles.displayText}>SCAN </Text>
          </TouchableOpacity>
          </View>
          <View>

            <TouchableOpacity 
          style={styles.scannedButton} 
          onPress={()=>{this.handleTransaction()}}>
          <Text style={styles.displayText}>SUBMIT </Text>
          </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
      )
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDisplay:{
    fontSize:15,
    textDecorationColor:"underline"
  },
  scannedButton:{
    backgroundColor:"green",
    width:60,
    borderWidth:1.5,
    borderLeftWidth:0
  },
  buttonText:{
    fontSize:15,
    textAlign:"center",
    marginTop:10
  },
  InputView:{
    flexDirection:"row",
    margin:20
  },
  InputBox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    TextSize:20
  },
});
