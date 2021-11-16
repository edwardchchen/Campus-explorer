import Typography from "@material-ui/core/Typography";
import {
	Button,
	Container,
	Divider,
	FormControl,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import React from "react";
import Warning from "../components/Snackbar";
const useStyles = makeStyles((theme) => ({
	title:{
		fontWeight: 500,
	},
	container:{
		paddingLeft: theme.spacing(10),
	},
	button:{
		marginTop: 15,
	},
	textField:{
		marginTop: 30,
	},

}));
const axios = require('axios');

export default function EditPage(props){
	const [datasetToAdd, setDataSetToAdd] = React.useState('');
	const [datasetToRemove, setDataSetToRemove] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const [message, setMessage] = React.useState(false);
	const classes = useStyles()

	const handleRemove = () => {
		console.log(datasetToRemove)
		let url = "http://localhost:4321/dataset/:'+datasetToRemove"
		axios.delete(url)
			.then(res => {
			console.log(res);
			alert("Dataset removed")
		}).catch((err)=>{
			setOpen(true)
			if(err.response.status===404){
				alert("Dataset Not Found")
			}else{
				alert("Invalid Dataset Id")
			}
		});
	}

	return(
		<div>
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				Add dataset
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>

				<TextField  id="outlined-basic" label="DataSet ID" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>
				<FormControl fullWidth>
				<InputLabel className={classes.textField} id="select">Kind</InputLabel>
				<Select

					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={datasetToAdd}
					onChange={(event)=>setDataSetToAdd(event.target.value)}
				>
					<MenuItem value={"courses"}>Courses</MenuItem>
					<MenuItem value={"rooms"}>Rooms</MenuItem>
				</Select>
			</FormControl>
				</Grid>
				{/*<Grid item xs={3}>*/}

				{/*<Button className={classes.button} color='primary'*/}
				{/*	variant="contained"*/}
				{/*	component="label"*/}
				{/*>*/}
				{/*	Upload File*/}
				{/*	<input*/}
				{/*		type="file"*/}
				{/*		hidden*/}
				{/*	/>*/}
				{/*</Button>*/}
				{/*</Grid>*/}
				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium' variant='contained'>
						Submit
					</Button>
				</Grid>
			</Grid>
		</Container>
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				Remove dataset
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>
					<TextField  id="outlined-basic" label="DataSet ID" variant="outlined" margin="normal"
					onChange={(event)=>setDataSetToRemove(event.target.value)}/>
				</Grid>

				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium' variant='contained'
					onClick={handleRemove}>
				Remove
			</Button>
				</Grid>
			</Grid>
		</Container>
		</div>

)
}
