import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  CssBaseline,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Paper,
} from "@mui/material";
import {
  Sidebar,
  Menu,
  MenuItem,
  ProSidebarProvider,
  useProSidebar,
} from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // Tick Icon
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Navbar from "../Navbar";
import ManageUsers from "./ManageUsers";
import AddProduct from "./AddProducts";
import ProductList from "./ProductList";
import VerifyPayment from "./VerifyPayment"; // Import VerifyPayment component

const AdminPanel = () => {
  const [selectedOption, setSelectedOption] = useState("Dashboard");
  const { toggleSidebar, collapseSidebar, broken, collapsed } = useProSidebar(); // Add `broken` for breakpoint responsiveness
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Explicit control of sidebar expansion state
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    userCount: 0,
    recentOrders: [],
    salesByProduct: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const statsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/admin/dashboard-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await statsResponse.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle Menu Click: Toggles the sidebar
  const handleMenuClick = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
    toggleSidebar(); // Ensures the ProSidebar handles internal toggling
  };

  // Handle Menu Item Click: Collapses sidebar after item selection
  const handleMenuItemClick = (option) => {
    setSelectedOption(option);
    if (isSidebarExpanded) {
      collapseSidebar();
      setIsSidebarExpanded(false); // Update the expanded state
    }
  };

  const renderContent = () => {
    switch (selectedOption) {
      case "Dashboard":
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
            <Grid container spacing={3} sx={{ marginTop: 3 }}>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                  <Typography variant="h6">Total Sales</Typography>
                  <Typography variant="h4">{stats.totalSales}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                  <Typography variant="h6">Total Revenue</Typography>
                  <Typography variant="h4">₹ {stats.totalRevenue}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                  <Typography variant="h6">Today's Sales</Typography>
                  <Typography variant="h4">₹ {stats.todaySales}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
                  <Typography variant="h6">Number of Users</Typography>
                  <Typography variant="h4">{stats.userCount}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case "Users":
        return <ManageUsers />;
      case "Add Item":
        return <AddProduct />;
      case "Product List":
        return <ProductList />;
      case "Verify Payments":
        return <VerifyPayment />;
      default:
        return <Typography variant="h6">Select an option from the sidebar</Typography>;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh-70px)" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar
        defaultCollapsed
        collapsed={!isSidebarExpanded} // Collapse based on our explicit state
        style={{ height: "calc(100vh - 70px)", marginTop: "70px" }}
      >
        <Menu>
          {/* Collapse Sidebar Button */}
          <MenuItem
            icon={<MenuOutlinedIcon />}
            onClick={handleMenuClick} // Toggles sidebar only when this button is clicked
            style={{ textAlign: "center" }}
          >
            <Typography variant="h6">Admin</Typography>
          </MenuItem>

          {/* Sidebar Menu Items */}
          <MenuItem
            icon={<HomeOutlinedIcon />}
            onClick={() => handleMenuItemClick("Dashboard")}
            active={selectedOption === "Dashboard"}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            icon={<PeopleOutlinedIcon />}
            onClick={() => handleMenuItemClick("Users")}
            active={selectedOption === "Users"}
          >
            Manage Users
          </MenuItem>
          <MenuItem
            icon={<ContactsOutlinedIcon />}
            onClick={() => handleMenuItemClick("Add Item")}
            active={selectedOption === "Add Item"}
          >
            Add Item
          </MenuItem>
          <MenuItem
            icon={<ReceiptOutlinedIcon />}
            onClick={() => handleMenuItemClick("Product List")}
            active={selectedOption === "Product List"}
          >
            Product List
          </MenuItem>
          <MenuItem
            icon={<CheckCircleOutlineIcon />}
            onClick={() => handleMenuItemClick("Verify Payments")}
            active={selectedOption === "Verify Payments"}
          >
            Verify Payments
          </MenuItem>
        </Menu>
      </Sidebar>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          padding: "20px",
          overflowX: "hidden",
        }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: 1201,
            backgroundColor: "#000",
          }}
        >
          <Toolbar>
            <Navbar />
          </Toolbar>
        </AppBar>
        <Container>
          <Toolbar /> {/* This adds the spacing */}
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

// Wrap AdminPanel with ProSidebarProvider
const WrappedAdminPanel = () => (
  <ProSidebarProvider>
    <AdminPanel />
  </ProSidebarProvider>
);

export default WrappedAdminPanel;