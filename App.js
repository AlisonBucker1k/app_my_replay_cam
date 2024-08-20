import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "expo-status-bar"
import { PaperProvider } from "react-native-paper"
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomePage from "./screens/Home"
import SearchArenas from "./screens/SearchArenas"
import Courts from "./screens/Courts"
import CourtsVideos from "./screens/CourtsVideos"
import { TouchableOpacity, Text } from "react-native"

const App = () => {

  const Stack = createNativeStackNavigator();

  return (
    <PaperProvider>
      <StatusBar style="light" backgroundColor="#FBB02E"/>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FBB02E',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomePage}
            options={{
              headerTitle:"My Replay Cam",
              headerShown:false
            }}
          />
          <Stack.Screen 
            name="SearchArenas" 
            component={SearchArenas}
            options={{
              headerTitle:"Search Arenas",
              // headerShown:false
            }}
          />
          <Stack.Screen 
            name="Courts" 
            component={Courts}
            options={{
              headerTitle:"Courts",
            }}
          />
          <Stack.Screen 
            name="CourtsVideos" 
            component={CourtsVideos}
            options={{
              headerTitle:"Court Videos",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  )
}

export default App
// Build failed: The "Run fastlane" step failed with an unknown error. Refer to "Xcode Logs" below for additional, more detailed logs.