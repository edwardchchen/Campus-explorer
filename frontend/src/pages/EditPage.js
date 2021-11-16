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
import courses from "../datasets/courses";
import rooms from "../datasets/rooms";
const fs = require('fs');
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
	const [datasetKind,setDatasetKind] = React.useState('');
	const [datasetToRemove, setDataSetToRemove] = React.useState('');
	const [open, setOpen] = React.useState(false);
	const [message, setMessage] = React.useState(false);
	const classes = useStyles()

	const handleRemove = () => {
		console.log(datasetToRemove)
		let url = "http://localhost:4321/dataset/:"+datasetToRemove
		axios.delete(url)
			.then(res => {
			console.log(res);
			alert("Dataset removed")
		}).catch((err)=>{
			setOpen(true)
			if(err.response.status===404){
				alert("Dataset not found")
			}else{
				alert("Invalid dataset id")
			}
		});
	}
	const readDS =(dir)=>{
		return fs.readFileSync(dir).toString("base64")
	}
	const handleAdd = () => {
		let url = "http://localhost:4321/dataset/:"+datasetToAdd+"/:"+datasetKind
		let content = datasetKind === "rooms" ? rooms : courses;
		url = "http://localhost:4321/dataset/id/courses"

		axios.put(
			url,
			content,
		{headers: {"Content-Type": "application/x-zip-compressed"}})
			.then(res => {
				console.log(res);
				alert("Dataset Added")
			}).catch((err)=>{
			setOpen(true)
			if(err.response.status===404){
				alert("Dataset not found")
			}else{
				alert("Invalid dataset id")
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
					<Button className={classes.button}
							color='primary' size='medium' variant='contained'
							onClick={handleAdd}>
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
					onClick={handleRemove} disabled={datasetToRemove===""}>
				Remove
			</Button>
				</Grid>
			</Grid>
		</Container>
		</div>

)
}
