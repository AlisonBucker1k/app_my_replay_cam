import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { ScrollView, View, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"

const Courts = ({route}) => {
    const navigation = useNavigation()
    const arena = route.params

    const [courts, setCourts] = useState([])
    const [loading, setLoading] = useState(false)

    const handleGetCourts = async () => {
        setLoading(true)
        const request = await fetch(`https://api.filmo.club/api/arenas/${arena.id}/courts`)
        const response = await request.json()

        setCourts(response)
        setLoading(false)
    }

    const navigateToCourtVideos = (court) => {
        navigation.navigate('CourtsVideos', {arena, court})
    }

    useEffect(() => {
        handleGetCourts()
    }, [])

    return (
        <SafeAreaView
            style={{backgroundColor:'#272B30', display:'flex', flex: 1, alignItems:'center', justifyContent:'space-between'}}
        >
            {loading &&
                <ActivityIndicator color="#FBB02E"/>
            }

            <ScrollView showsVerticalScrollIndicator={false}  style={{flex:1, width:'90%', marginTop:25}}>

            {courts.map((item, key) => (
                <TouchableOpacity key={key} style={{marginBottom: 8}} onPress={() => navigateToCourtVideos(item)}>
                    <View style={{flex:1, backgroundColor: '#23262b', padding: 15, display: 'flex', flexDirection:'row'}}>
                        <View style={{flex: 1}}>
                            <Text style={{color: '#eee', fontWeight:800, fontSize:15, width: '100%'}}>{item.description}</Text>
                            <Text style={{color: '#eee', fontWeight:600, fontSize:12, width: '100%'}}>{item.description}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}

            </ScrollView>

        </SafeAreaView>
    )
}

export default Courts