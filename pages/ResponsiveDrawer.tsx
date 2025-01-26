import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface TemporaryDrawerProps {
  open: boolean;
  toggleDrawer: (newOpen: boolean | ((prevState: boolean) => boolean)) => () => void;
}

// Custom theme with dark purple color
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#c8b3e6', // Light purple
    },
  },
  typography: {
    allVariants: {
      color: '#FFFFFF', // White text for all typography components
    },
  },
});

export default function TemporaryDrawer({ open, toggleDrawer }: TemporaryDrawerProps) {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    sliderValue: 3,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSliderChange = (event: Event, value: number | number[]) => {
    setFormData((prevData) => ({
      ...prevData,
      sliderValue: Array.isArray(value) ? value[0] : value,
    }));
  };

  const handleSubmit = () => {
    console.log('Form data submitted:', formData);
    toggleDrawer(false)(); // Close the drawer after submission
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background with 60% opacity
          },
        }}
      >
        <Box
          sx={{ width: 300, padding: 4 }}
          role="presentation"
          display="flex"
          flexDirection="column"
          gap={2}
        >
          {/* Header */}
          <Typography variant="h6" component="h2" sx={{ textAlign: 'center' }}>
            Share your story
          </Typography>

          {/* Slider */}
          <Typography gutterBottom>Safety rating: 1 (not safe) to 5 (very safe)</Typography>
          <Slider
            value={formData.sliderValue}
            onChange={handleSliderChange}
            aria-label="Rating"
            valueLabelDisplay="auto"
            min={1}
            max={5}
          />

          {/* Description Input */}
          <TextField
            label="Your experiences at this location"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)', // Light gray outline
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFFFFF', // White outline on hover
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7e35e6', // Purple outline when focused
                },
              },
              '& .MuiInputBase-input': {
                color: '#FFFFFF', // White input text
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)', // Light gray label
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#FFFFFF', // White label when focused
              },
            }}
          />

          {/* Save Button */}
          <Box sx={{ paddingTop: 1 }}>
            <Button
              variant="contained"
              color="primary" // Uses the primary color from the theme
              onClick={handleSubmit}
              fullWidth
            >
              Save
            </Button>
          </Box>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
}
