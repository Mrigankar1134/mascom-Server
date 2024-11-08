// import React, { useEffect, useState } from 'react';
// import { Grid, Button, Typography, Divider } from '@mui/material';
// import Navbar from '../Navbar';
// import { useNavigate } from 'react-router-dom';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     // Check if the user is logged in by checking the token in localStorage
//     const token = localStorage.getItem('token');
//     setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
//   }, []);

//   return (
//     <Grid container spacing={2} justifyContent="center">
//       <Grid item xs={12}>
//         <Navbar />
//       </Grid>
//       <Grid item xs={12} sm={6} style={{ height: 'calc(100vh - 64px)', padding: "40px" }}>
//         <Grid container sx={{ flex: 1 }} alignItems='center' justifyContent="center" direction="column">
//           <Grid item sx={{ width: '100%' }}>
//             <img style={{ width: "100%", height: 'auto' }} src={require('../mascom_black.png')} alt='' />
//           </Grid>
//           <Grid item sx={{ width: "100%" }}>
//             <Typography align='center' variant='h6'><b>Order your favorite Merchandise.</b></Typography>
//           </Grid>
//           <br />
//           <Grid item sx={{ width: "100%" }}>
//             <Divider />
//           </Grid>
//           <br />
//           <Grid container direction="row" sx={{ width: "100%" }}>
//             <Grid item md={6} xs={12}>
//               <img style={{ width: "100%", height: 'auto' }} src={require('../Clothing/Front.jpg')} alt="Front of T-shirt" />
//             </Grid>
//             <Grid item alignContent="center" md={6} xs={12}>
//               <Typography align='justify'>
//                 Introducing Bold, fresh, and unique—this limited edition tee sets you apart. Be a trendsetter and grab yours now before it’s gone! Make any outfit lemon fresh with boohoo.
//               </Typography>
//             </Grid>
//           </Grid>
//           <br />
//           <Grid item sx={{ width: "100%" }}>
//             <Divider />
//           </Grid>
//           <br />
//           <Grid container direction="row" sx={{ width: "100%" }}>
//             <Grid alignContent='center' item md={6} xs={12}>
//               <Typography align='justify'>
//                 Get your hands on this limited edition IIM Amritsar batch t-shirt! Sleek, stylish, and perfect for showing your pride. Grab yours now and stand out wherever you go!
//               </Typography>
//             </Grid>
//             <Grid item md={6} xs={12}>
//               <img style={{ width: "100%", height: 'auto' }} src={require('../Clothing/Back.jpg')} alt="Back of T-shirt" />
//             </Grid>
//           </Grid>
//           <Grid item sx={{ width: "100%" }}>
//             <Divider />
//           </Grid>
//           <br />
//           <Grid item xs={12}>
//             <img style={{ width: "100%", height: 'auto' }} src={require('../Clothing/SizeChart.jpg')} alt="Size chart" />
//           </Grid>
//           <Typography align='center' fontSize={12}>
//             <a href='https://mascom-document-store.s3.ap-south-1.amazonaws.com/Terms+and+Conditions+for+IIM+Amritsar+MasCom+Website.pdf' target="_blank" rel="noreferrer" style={{ color: 'grey', textDecoration: 'underline' }}>By Using this Website, you Agree to "Terms and Conditions" of this website.</a>
//           </Typography>
//           <br />
//           <Grid item sx={{ width: '80%' }}>
//             <Button 
//               onClick={() => { navigate(isLoggedIn ? '/cart' : '/form') }}
//               sx={{ width: "100%", bgcolor: "#000000", '&:hover': { backgroundColor: '#000000' } }} 
//               variant='contained'
//             >
//               {isLoggedIn ? 'Proceed' : 'Login'}
//             </Button>
//           </Grid>
//           <br />
//           <br />
//         </Grid>
//       </Grid>
//     </Grid>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      <Navbar />
      <Box className="dashboard-container">
        <Box className="dashboard-overlay">
          <Box className="dashboard-content">
            <Typography variant="h2" className="dashboard-title">
              WE DON'T JUST MAKE APPAREL, WE DEFINE THE STYLE OF IIM AMRITSAR
            </Typography>
            <Typography variant="h5" className="dashboard-subtitle">
              ~ MASCOM
            </Typography>
            <Box className="button-container" style={{ paddingLeft: '30px' }}>
              <button
                className="cta"
                onClick={() => navigate(isLoggedIn ? '/cart' : '/form')}
              >
                <span className="span">{isLoggedIn ? 'PROCEED' : 'LOGIN'}</span>
                <span className="second">
                  <svg width="50px" height="20px" viewBox="0 0 66 43" xmlns="http://www.w3.org/2000/svg">
                    <g id="arrow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <path className="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                      <path className="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                      <path className="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
                    </g>
                  </svg>
                </span>
              </button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;