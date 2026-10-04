import { StatusBar } from 'expo-status-bar';
import StockScreen from './src/screens/StockScreen';

export default function App() {
  return (
    <>
      <StockScreen />
      <StatusBar style="auto" />
    </>
  );
}