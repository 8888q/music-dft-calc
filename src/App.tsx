import { useState } from 'react';
import './App.css';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';

type complexNumber = [number, number];
const decimalPrecision: number = 6;
const precisionCutoff: number = 0.0000001;

function App() {
  const [characteristicFunctionInput, setCharacteristicFunctionInput] = useState("0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0");
  const [pitchClass, setPitchClass] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [complexNumbers, setComplexNumbers] = useState<complexNumber[]>([]);
  const [inputError, setInputError] = useState(false);
  const [errorText, setErrorText] = useState("");

  function handlePitchClassInputChange(event: React.ChangeEvent<HTMLInputElement>){
    setCharacteristicFunctionInput(event.target.value);
    const newScale: number[] = event.target.value.split(",").map( s => parseFloat(s.trim()) );
    if( newScale.length != 12 ){
      setInputError(true);
      setErrorText("Characteristic Function must have 12 entries");
    }
    else if( newScale.some( n => Number.isNaN(n))){
      setInputError(true);
      setErrorText("Characteristic Function entries must be numeric");
    }
    else{
      setInputError(false);
      setErrorText("");
      setPitchClass(newScale);
    }
  }

  function computeDFT( characteristicFunction: number[] ){
    if( characteristicFunction.length != 12 ) return;
    const realParts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const imaginaryParts: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for( let k = 0; k < 12; k++ ){
      let realPart = 0;
      let imaginaryPart = 0;
      for( let j = 0; j < 12; j++ ){
        realPart += characteristicFunction[j] * Math.cos(2 * Math.PI * k * j / 12);
        imaginaryPart += characteristicFunction[j] * Math.sin(2 * Math.PI * k * j / 12);
      }
      realParts[k] = realPart;
      imaginaryParts[k] = imaginaryPart;
    }

    const complexList: complexNumber[] = [];
    for( let i = 0; i < 8; i++ ){
      if( realParts[i] < precisionCutoff && realParts[i] > -precisionCutoff ) realParts[i] = 0;
      if( imaginaryParts[i] < precisionCutoff && imaginaryParts[i] > -precisionCutoff ) imaginaryParts[i] = 0;
      complexList.push([realParts[i], imaginaryParts[i]])
    }

    setComplexNumbers(complexList);
  }

  return (
    <Box display="flex" flexDirection="column" gap="32px" alignItems="center" minHeight="100vh" width="100vw" bgcolor="#fce5de" >
      <Typography variant='h3' paddingTop="64px">Characteristic Function DFT Calculator</Typography>
      <Box display="flex" flexDirection="row" gap="32px" width="40vw" >
        <TextField fullWidth error={inputError} helperText={errorText} label="Characteristic Function" value={characteristicFunctionInput} onChange={handlePitchClassInputChange} />
        <Button variant='contained' onClick={() => computeDFT(pitchClass)} >Calculate</Button>
      </Box>
      <TableContainer sx={{width: "60vw" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Index</TableCell>
              <TableCell align="right">Magnitude</TableCell>
              <TableCell align="right">Magnitude<sup>2</sup></TableCell>
              <TableCell align="right">Angle &Theta; (radians)</TableCell>
              <TableCell align="right">Angle &Theta; (degrees)</TableCell>
              <TableCell align="right">Real Part</TableCell>
              <TableCell align="right">Imaginary Part</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              complexNumbers.map( z => {

                const magnitudeSquared = z[0] * z[0] + z[1] * z[1];
                let theta = Math.atan2(z[1], z[0]);
                if( theta < precisionCutoff && theta > -precisionCutoff ) theta = 0;
                if( theta < 0 ) theta += 2 * Math.PI;

                return (
                  <TableRow>
                    <TableCell>{complexNumbers.findIndex((x) => x == z)}</TableCell>
                    <TableCell align="right">{Math.sqrt( magnitudeSquared ).toPrecision(2)}</TableCell>
                    <TableCell align="right">{magnitudeSquared.toPrecision(decimalPrecision)}</TableCell>
                    <TableCell align="right">{theta.toPrecision(decimalPrecision) + " rad"}</TableCell>
                    <TableCell align="right">{(theta * 180 / Math.PI).toPrecision(decimalPrecision)}&deg;</TableCell>
                    <TableCell align="right">{z[0].toPrecision(decimalPrecision)}</TableCell>
                    <TableCell align="right">{z[1].toPrecision(decimalPrecision)}</TableCell>
                  </TableRow>
                );
              } )
            }
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default App;