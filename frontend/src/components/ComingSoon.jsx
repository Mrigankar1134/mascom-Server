import React from 'react';
import {Grid, Typography} from '@mui/material';
import Navbar from './Navbar'
import {TypeAnimation} from 'react-type-animation'


const Dashboard = () => {

    return ( 
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
                <Navbar/>
            </Grid>

            <Grid item xs={12} sm={6} style={{ height: 'calc(100vh - 64px)' , padding : "40px"}}>               
                    <Grid container sx={{flex: 1}} alignItems='center' justifyContent="center" direction="column">
                        <Grid item sx={{width: '100%'}} >
                            <img style={{width:"100%",height: 'auto'}} src={require('./mascom_black.png')} alt=''/>
                        </Grid>
                        <Grid item sx={{width: "100%"}}>
                            <Typography align='center' variant='h6'><b>Order your favorite Merchandise here.</b></Typography>
                        </Grid>
                        <br/>
                        <br/>
                        <Grid item container justifyContent='center' sx={{width: "100%"}}>
                        <b><TypeAnimation
                            sequence={[
                                // Same substring at the start will only be typed out once, initially
                                'Sale',
                                2000, // wait 1s before replacing "Mice" with "Hamsters"
                                'has',
                                2000,
                                'Ended',
                                2000,
                                'New Merch Soon',
                                3000,
                            ]}
                            wrapper="span"
                            speed={50}
                            style={{fontFamily:'serif' ,color:"#373737" , fontSize: '1.8em', display: 'inline-block' }}
                            repeat={Infinity}
                            /></b>
                        </Grid>
                        <br/>
                        <br/>
                        <Typography align='center' fontSize={12}>
                        <a href='https://mascom-document-store.s3.ap-south-1.amazonaws.com/Terms+and+Conditions+for+IIM+Amritsar+MasCom+Website.pdf' target="_blank" rel="noreferrer" style={{ color: 'grey', textDecoration: 'underline' }} >By Using this Website, you Agree to "Terms and Conditions" of this website.</a>
                        </Typography>
                    </Grid>
            </Grid>
        </Grid>
    )
}

export default Dashboard;