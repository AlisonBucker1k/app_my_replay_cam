import { useNavigation } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { ScrollView, TouchableHighlight, View, Image, TouchableOpacity, ActivityIndicator } from "react-native"
import { Avatar, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import AsyncStorage from '@react-native-async-storage/async-storage'

const SearchArenas = () => {

    const navigation = useNavigation()

    const [term, setTerm] = useState(null)
    const [arenas, setArenas] = useState([])
    const [loading, setLoading] = useState(false)
    const [sRecents, setSRecents] = useState([])

    const handleSearch = async () => {
        if (term != null && term.length >= 3) {
            setLoading(true)
            const request = await fetch(`https://api.filmo.club/api/search/arenas?keywords=${term}`)
            const response = await request.json()

            setArenas(response)
            setLoading(false)
        } else {
            setArenas([])
        }
    }

    const navigateToCourt = async (arena) => {
        saveRecents(arena)

        navigation.navigate('Courts',arena)
    }

    const saveRecents = async (arena) => {
        let recents = await AsyncStorage.getItem('recentss')

        if (recents === null) {
            recents = []
        } else {
            recents = JSON.parse(recents)
        }

        recents.unshift(arena)


        let newArray = recents.filter(function (a, key) {
            
            if (key < 5) {
                return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true);
            }

        }, Object.create(null))

        await AsyncStorage.setItem('recentss', JSON.stringify(newArray))
        setSRecents(newArray)
        
    }

    const handleRecents = async () => {
        let recents = await AsyncStorage.getItem('recentss')

        if (recents !== null && recents.length > 0) {
            setSRecents(await JSON.parse(recents))
        }
    }

    useEffect(() => {
        handleRecents()
    }, [])

    useEffect(() => {
        handleSearch()
    }, [term])


    return (
        <SafeAreaView
            style={{backgroundColor:'#272B30', display:'flex', flex: 1, alignItems:'center', justifyContent:'space-between'}}
        >
            <TextInput 
                dark={true}
                style={{backgroundColor:'rgba(255, 255, 255, 0.534)', width:'90%'}}
                textColor='#FBB02E'
                label="Search Arenas Here..."
                placeholder="Search Arenas Here..."
                onChangeText={text => setTerm(text)}
                underlineColor="#FBB02E"
                activeUnderlineColor="#FBB02E"
                selectionColor="#FBB02E"
                activeOutlineColor="black"
                placeholderTextColor='#aaa'
                value={term}
            />

            <ScrollView showsVerticalScrollIndicator={false}  style={{flex:1, width:'90%', marginTop:25}}>

                {loading &&
                    <ActivityIndicator color="#FBB02E"/>
                }

                {arenas.map((item, key) => (
                    <TouchableOpacity key={key} style={{marginBottom: 8}} onPress={() => navigateToCourt(item)}>
                        <View style={{flex:1, backgroundColor: '#23262b', padding: 15, display: 'flex', flexDirection:'row'}}>
                            {/* <Image style={{width: 50, height:50, marginRight:15}} source={require('../../assets/app-icon.png')}/> */}
                            <Avatar.Image source={{uri:`https://api.filmo.club/api/users/${item.id}/avatar`}} style={{backgroundColor:'#FBB02E'}}/>
                            <View style={{flex: 1, marginLeft:20}}>
                                <Text style={{color: '#eee', fontWeight:800, fontSize:15, width: '100%'}}>{item.displayName}</Text>
                                <Text style={{color: '#eee', fontWeight:600, fontSize:12, width: '100%'}}>@{item.username}</Text>

                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={{color: '#fff', textTransform:'uppercase', fontSize: 14, marginBottom: 10}}>Recents Searchs</Text>
                {sRecents.map((item, key) => (
                    <TouchableOpacity key={key} style={{marginBottom: 8}} onPress={() => navigateToCourt(item)}>
                        <View style={{flex:1, backgroundColor: '#23262b', padding: 15, display: 'flex', flexDirection:'row'}}>
                            <Avatar.Image source={{uri:`https://api.filmo.club/api/users/${item.id}/avatar`}} style={{backgroundColor:'#FBB02E'}}/>
                            <View style={{flex: 1, marginLeft:20}}>
                                <Text style={{color: '#eee', fontWeight:800, fontSize:15, width: '100%'}}>{item.displayName}</Text>
                                <Text style={{color: '#eee', fontWeight:600, fontSize:12, width: '100%'}}>@{item.username}</Text>

                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {arenas.length < 1 && sRecents.length < 1 &&
                    <View style={{display:'flex', alignItems:'center', justifyContent:'center', flex: 1, height:'500px'}}>
                        <Image source={require('../../assets/appImages/logo-2.png')} style={{ width:340, height:245, opacity:0.1, alignItems:'center', justifyContent:'center', marginTop:120 }}/>
                    </View>
                }

            </ScrollView>
        </SafeAreaView>
    )

}

export default SearchArenas