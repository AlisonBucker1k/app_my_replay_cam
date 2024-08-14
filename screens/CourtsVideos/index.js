import React, { useEffect, useLayoutEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { ScrollView, View, TouchableOpacity, Text, Image, Linking, StyleSheet, Modal, Share, Button, Platform, ActivityIndicator } from "react-native"
import { FlexGrid, ResponsiveGrid } from "react-native-flexible-grid"
import moment from "moment"
import AntDesign from '@expo/vector-icons/AntDesign'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { Video, ResizeMode } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import { useNavigation } from "@react-navigation/native"
import * as MediaLibrary from 'expo-media-library';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Permissions from 'expo-permissions'

const CourtsVideos = ({route}) => {
    const {arena, court} = route.params

    const video = React.useRef(null);
    const [status, setStatus] = useState({});

    const [bearer, setBearer] = useState(null)
    const [videos, setVideos] = useState([])
    const [modalVideo, setModalVideo] = useState(false)
    const [currentVideo, setCurrentVideo] = useState(null)
    const [lastVideo, setLastVideo] = useState(null)

    // Datetime Filter
    const [modalFilter, setModalFilter] = useState(false)
    const [datetime, setDatetime] = useState(null)

    const [loading, setLoading] = useState(false)

    const [isDownloading, setIsDownloading] = useState(false);

    const navigation = useNavigation()

    const login = async () => {
        setLoading(true)
        const request = await fetch('https://api.filmo.club/api/auth/login', {
            method:'POST',
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                "username":"Alison Bucker",
                "password":"54585652",
                "deviceInfo":"null"
            })
        })

        const response = await request.json()
        setBearer(response.access_token)
        setLoading(false)
    }

    const handleGetVideos = async (before = false, filter = null) => {

        let query = ''

        if (filter === null) {
            query = (before) ? `&before=${lastVideo.createdAt}`:''
        } else {
            query = (filter) ? `&before=${filter}`:''
        }

        setLoading(true)
        if (bearer != null){
            const request = await fetch(`https://api.filmo.club/api/videos?arena=${arena.id}&court=${court.id}${query}&batch=10`, {
                method:"GET",
                headers:{
                    Authorization: `Bearer ${bearer}`
                }
            })
            const response = await request.json()

            if (!before) {
                setVideos([])
                setVideos(response)
            } else {
                let newList = videos.concat(response)

                setVideos(newList)
            }

            setLastVideo(response.at(-1))
        }

        setLoading(false)
    }

    const renderItem = (item) => {
        // console.log(`https://api.filmo.club/api/videos/${item.item.id}/thumb`)
        return (
            <TouchableOpacity style={{backgroundColor:"#fff", margin:1}} onPress={() => handleShownVideo(item.item)}>
                <Image
                    source={{ uri: `https://api.filmo.club/api/videos/${item.item.id}/thumb` }}
                    style={{width: '100%', height: '100%'}}
                    resizeMode="cover"
                />
                <View style={{position:'absolute', backgroundColor:'rgba(107, 107, 107, 0.2)', flex:1, width: '100%', height:'100%', display:'flex', alignItems:'flex-start', justifyContent:'flex-end', padding:5}}>
                    <Text style={{color:"#fff"}}>{moment(item.item.createdAt).format('LLL')}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const handleShownVideo = (videoData) => {
        setModalVideo(true)
        setCurrentVideo(videoData.id)
    }
    const handleCloseModal = () => {
        setModalVideo(false)
        setCurrentVideo(null)
    }

    const handleShare = async () => {
        const options = {
            message: `Watch this epic play that happened at ${arena.displayName}! https://api.filmo.club/api/videos/${currentVideo}/blob`,
        }

        try {
            const action = await Share.share(options)
        } catch (e) {
            console.log('Erro => '+e)
        }
    }

    const requestPermissions = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Permissão necessária', 'Precisamos de permissões de armazenamento para continuar.');
            return false;
        }

        if (Platform.OS === 'android' && Platform.Version < 30) {
        const { status: storageStatus } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY_WRITE_ONLY);
        if (storageStatus !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de permissões de armazenamento para continuar.');
            return false;
        }
        }

        return true;
    };

    const downloadVideo = async (url) => {
        try {
            setIsDownloading(true);
            const video = await FileSystem.downloadAsync(
              url,
              FileSystem.documentDirectory + 'myreplay.mp4'
            );
            return video.uri;
          } catch (error) {
            console.error('Erro ao baixar o vídeo', error);
            return null;
          } finally {
            setIsDownloading(false);
          }
    }

    const saveToGallery = async (uri) => {
        try {
            const asset = await MediaLibrary.createAssetAsync(uri);
            await MediaLibrary.createAlbumAsync('Download', asset, false);
            alert('The video download has finished. Check your gallery!');
        } catch (error) {
            // console.error('Erro ao salvar na galeria', error);
            alert('The video download has finished. Check your gallery.');
        }
        };

        const downloadAndSaveVideo = async (url) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const videoUri = await downloadVideo(url);
        if (videoUri) {
            await saveToGallery(videoUri);
        }
    };

    const handleDownloadV2 = async () => {
        const perm = ''
        

        try {
            const asset = await MediaLibrary.createAssetAsync(`https://api.filmo.club/api/videos/${currentVideo}/blob`);
            const album = await MediaLibrary.getAlbumAsync('Download');

            if (album == null) {
                await MediaLibrary.createAlbumAsync('Download', asset, false);
              } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              }

        }catch (e){
            console.log(e)
        }

    }

    const save = async (uri, filename, mimetype) => {
        if (Platform.OS === 'android') {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

            if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64})
                await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
                .then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, base64, {encoding: FileSystem.EncodingType.Base64})
                })
                .catch(e => console.log(e))

            } else {
                shareAsync(uri)    
            }

        } else {
            shareAsync(uri)
        }
    }
    
    const handleFilter = (date) => {
        setDatetime(date)
        handleGetVideos(false, date)
        setModalFilter(false)
    }

    const handleCancelFilter = () => {
        setDatetime(null)
        handleGetVideos()
        setModalFilter(false)
    }

    useEffect(() => {
        login()
    }, [])

    useEffect(() => {
        handleGetVideos()
    }, [bearer])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={() => setModalFilter(true)}><FontAwesome5 name="filter" size={24} color="#fff" /></TouchableOpacity>
        })
    }, [])

    useEffect(() => {
        console.log(`https://api.filmo.club/api/videos/${currentVideo}/thumb`)
    }, [currentVideo])

    return (
        <SafeAreaView
            style={{backgroundColor:'#272B30', flex: 1}}
        >   
            {loading &&
                <ActivityIndicator color="#FBB02E"/>
            }
           <ResponsiveGrid 
                maxItemsPerColumn={2}
                keyExtractor={(item) => item.id}
                maxColumnRatioUnits={4}
                itemSizeUnit={500}
                data={videos}
                virtualizedBufferFactor={2}
                renderItem={renderItem}
                virtualization={true}
                style={{ padding: 5 }}
                itemUnitHeight={180}
                onEndReached={() => handleGetVideos(true)}
                onEndReachedThreshold={0.9}
           />

           <DateTimePickerModal
                isVisible={modalFilter}
                mode="datetime"
                onConfirm={(date) => handleFilter(date) }
                onCancel={() => handleCancelFilter()}
                isDarkModeEnabled={true}
                onHide={() => setModalFilter(false)}
            />

           <Modal
            visible={modalVideo}
            transparent={true}
            onRequestClose={() => handleCloseModal()}
            animationType="fade"
           >
           {/* <Animated.View
            
            pointerEvents="none"
            > */}
            <View
                style={[StyleSheet.absoluteFill, {backgroundColor:'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center'}]}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                    <Text style={{color: '#fff', fontWeight:800, fontSize:16}}>{arena.displayName}</Text>
                    <Text style={{color: '#fff', fontSize:13}}>{court.description}</Text>
                    </View>
                    {/* <Image source={{uri: 'https://media.gcflearnfree.org/ctassets/topics/246/share_flower_fullsize.jpg'}} style={styles.image} resizeMode="cover" /> */}
                    <Video
                        posterSource={{uri: `https://api.filmo.club/api/videos/${currentVideo}/thumb`}}
                        ref={video}
                        style={styles.video}
                        source={{
                        uri: `https://api.filmo.club/api/videos/${currentVideo}/blob`,
                        }}
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                        onPlaybackStatusUpdate={status => setStatus(() => status)}
                        shouldPlay
                    />
                    <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        {/* <TouchableOpacity style={styles.text} onPress={() => handleDownload()}> */}
                        {!isDownloading && 
                            <TouchableOpacity style={styles.text} onPress={() => {downloadAndSaveVideo(`https://api.filmo.club/api/videos/${currentVideo}/blob`)}}>
                                <AntDesign name="clouddownloado" size={24} color="#fff" />
                            </TouchableOpacity>
                        ||
                        <ActivityIndicator color="#FBB02E" style={styles.text} size={24}/>
                        }

                        {/* <TouchableOpacity style={styles.text} onPress={() => handleShare()}> */}
                            {/* <AntDesign name="sharealt" size={24} color="#fff" /> */}
                        {/* </TouchableOpacity> */}
                        <TouchableOpacity style={styles.text} onPress={() => handleCloseModal()}>
                            <AntDesign name="closecircleo" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    </View>
                </View>
            </View>
                
           {/* </Animated.View> */}
           </Modal>

           <Modal
            visible={modalFilter}
           >

           </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,.5)",
    },
    main: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    thumbnail: {
      width: 100,
      height: 100,
    },
    modal: {
      alignItems: "center",
      justifyContent: "center",
    },
    modalContainer: {
      width: "90%",
      height: "25%",
    },
    header: {
      backgroundColor: "#272B30",
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      overflow: "hidden",
      padding: 8,
    },
    footer: {
      backgroundColor: "#272B30",
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
      overflow: "hidden",
      padding: 8,
    },
    footerContent: {
      justifyContent: "space-around",
      flexDirection: "row",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    text: {
      flex: 1,
      fontSize: 18,
      textAlign: "center",
      color: "#fff",
      height:25,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      zIndex:9999
    },
    bold: {
      fontWeight: "bold",
    },
    video: {
        width: "100%",
        height: "100%"
    }
  });

export default CourtsVideos