import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Image, View, Text, TouchableOpacity, Linking, Modal } from "react-native"
import { Button, Headline } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
const HomePage = () => {
    const navigation = useNavigation()

    const [isLoading, setIsLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const handleMyReplays = () => {
        setIsLoading(true)

        setTimeout(() => {
            setIsLoading(false)
            navigation.navigate('SearchArenas')
        }, 1500)
    }

    const checkIsShowed = async () => {

        let warning = await AsyncStorage.getItem('warningMessage')
        
        let showed = (warning === null || warning == 'false')?false:true
       
        if (!showed) {
            setShowModal(true)
        }
    }

    const saveShowed = () => {
        AsyncStorage.setItem('warningMessage', 'true')
        setShowModal(false)
    }

    useEffect(() => {
        checkIsShowed()
    }, [])

    return (
        <>
            <SafeAreaView
                style={{backgroundColor:'#272B30', display:'flex', flex: 1, alignItems:'center', justifyContent:'space-between'}}
            >
                <Image source={require('../../assets/appImages/logo-my-replay.png')} style={{ width:350, height:80, marginTop:30 }}/>
                <Image source={require('../../assets/appImages/banner_0002_3-1.png')} style={{ width:300, height:370 }}/>

                <View>
                    <Headline style={{color: '#fff', fontSize:20, fontWeight:700}}>Remember Your</Headline>
                    <Headline style={{color: '#fff', fontSize:20, fontWeight:700, marginBottom: 15}}>Greatest Sports Moments</Headline>
                    <Text style={{color: '#fff', fontSize:14, fontWeight:200}}>Record the most ICONIC plays in your favorite sports!</Text>
                    <Button onPress={() => handleMyReplays()} mode="contained" loading={isLoading} uppercase="true" style={{backgroundColor:"#FBB02E", marginTop: 15, marginBottom:15}}>
                        <Text style={{color: '#fff', textAlign:'center'}}>Access My Plays</Text>
                    </Button>
                    <TouchableOpacity onPress={() => {Linking.openURL('https://bckcode.com')}}>
                        <Text style={{color: '#fff', textAlign:'center', fontWeight:200, marginBottom: 10}}>Powered By Bckcode</Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    transparent={true}
                    visible={showModal}
                    animationType="slide"
                >
                    <View
                        style={{display: 'flex', flex: 1,backgroundColor: 'rgba(0,0,0,0.8)', alignItems:'center', justifyContent:'center'}}
                    >

                        <View style={{backgroundColor: '#272B30', width: '90%', height:250, padding: 20, display: 'flex', justifyContent:'space-between', borderRadius: 15}}>
                            <Text style={{color: '#FBB02E', fontSize:25, textAlign:'center'}}>ATTENTION</Text>

                            <Text style={{color: '#cccccc', fontSize:15, textAlign:'center'}}>
                                My Replay is not responsible for how images/videos are used on the internet. Users are solely responsible for the content they share and its potential misuse.
                            </Text>

                            <Button onPress={saveShowed} mode="contained" uppercase="true" style={{backgroundColor:"#FBB02E", marginTop: 15, marginBottom:15}}>
                                <Text>
                                    I agree
                                </Text>
                            </Button>
                        </View>

                    </View>
                </Modal>

            </SafeAreaView>

        </>
    )

}

export default HomePage