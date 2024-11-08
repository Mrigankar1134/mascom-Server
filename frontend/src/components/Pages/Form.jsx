import React from 'react';
import DataForm from '../DataForm';
import Navbar from '../Navbar';
import {Grid} from '@mui/material'

const Form = ({cart, apivalues, setApiValues }) => {
    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid  item xs={12}>
                <Navbar/>
            </Grid>
  
            <Grid item 
            xs={12} sm={6}
            style={{ height: 'calc(100vh - 64px)' , padding : "40px"}}
            justifyContent="center">
                <DataForm apivalues={apivalues} setApiValues={setApiValues} cart={cart} />
            </Grid>
        </Grid>
    );
}
 
export default Form;