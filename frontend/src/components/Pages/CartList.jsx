import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CartList({ cart, setCart }) {
  const increasePCount = (id, size, color) => {
    setCart((prevItems) =>
      prevItems.map((item) =>
        item.p_id === id && item.p_size === size && item.p_color === color
          ? { ...item, p_count: item.p_count + 1 }
          : item
      )
    );
  };

  const decreasePCount = (id, size, color) => {
    setCart((prevItems) =>
      prevItems
        .map((item) =>
          item.p_id === id && item.p_size === size && item.p_color === color
            ? { ...item, p_count: item.p_count - 1 }
            : item
        )
        .filter((item) => item.p_count > 0)
    );
  };

  const deleteItem = (id, size, color) => {
    setCart((prevItems) =>
      prevItems.filter(
        (item) => !(item.p_id === id && item.p_size === size && item.p_color === color)
      )
    );
  };

  const totalPCount = cart.reduce((sum, item) => sum + item.p_count, 0);

  if (totalPCount === 0) {
    return <Typography>Your Cart is Empty</Typography>;
  } else {
    return (
      <List sx={{ width: '100%', flexGrow: 1, bgcolor: 'background.paper' }}>
        {cart.map((each) => {
          return (
            <React.Fragment key={`${each.p_id}-${each.p_size}-${each.p_color}`}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt={each.p_name} src={each.p_img[0]} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <>
                      {each.p_name} | Size: {each.p_size}
                      {each.p_color && each.p_color !== true ? ` | Color: ${each.p_color}` : ''}
                      {each.custom_name && (
                        <Typography variant="body2" color="text.secondary">
                          Custom Name: {each.custom_name}
                        </Typography>
                      )}
                    </>
                  }
                  secondary={
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton onClick={() => decreasePCount(each.p_id, each.p_size, each.p_color)}>
                          <RemoveCircleOutlineOutlinedIcon />
                        </IconButton>
                        <Typography color="text.primary"><b>Qty:&nbsp;{each.p_count}</b></Typography>
                        <IconButton onClick={() => increasePCount(each.p_id, each.p_size, each.p_color)}>
                          <AddCircleOutlineOutlinedIcon />
                        </IconButton>
                        <div style={{ marginLeft: 20 }}>
                          <Typography color="text.primary"><b>Price:&nbsp;&#8377;{each.p_price * each.p_count}</b></Typography>
                        </div>
                      </div>
                      <div>
                        <IconButton onClick={() => deleteItem(each.p_id, each.p_size, each.p_color)} aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          );
        })}
      </List>
    );
  }
}