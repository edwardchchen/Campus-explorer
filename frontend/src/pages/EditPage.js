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
	const classes = useStyles()

	const handleRemove = () => {
		console.log(datasetToRemove)
		let url = "http://localhost:4321/dataset/:"+datasetToRemove
		axios.delete(url)
			.then(res => {
				console.log(res);
				clearRemove()
				alert("Dataset removed")
		}).catch((err)=>{
			if(err.response){
				if(err.response.status===404){
					alert("Dataset not found")
				}else{
					alert("Invalid dataset id")
				}
			}else{
				alert(err)
			}
		});
	}

	const clearAdd =()=>{
		setDatasetKind("")
		setDataSetToAdd("")
	}
	const clearRemove =()=>{
		setDataSetToRemove("")
	}

	const handleAdd = () => {
		let url = "http://localhost:4321/dataset/:"+datasetToAdd+"/:"+datasetKind
		console.log(url)
		let content = datasetKind === "rooms" ? rooms : courses;
		axios.put(
			url,
			content,
		{headers: {"Content-Type": "application/x-zip-compressed"}})
			.then(res => {
				console.log(res);
				alert("Dataset "+ datasetToAdd +" added")
				clearAdd()
			}).catch((err)=>{
			if(err.response){
				console.log(err)
				alert("Invalid dataset id")
			}else{
				alert(err)

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

				<TextField  id="outlined-basic"
							label="DataSet ID" variant="outlined" margin="normal"
							value={datasetToAdd}
							onChange={(event)=>setDataSetToAdd(event.target.value)}
				/>
				</Grid>
				<Grid item xs={3}>
				<FormControl fullWidth>
				<InputLabel className={classes.textField} id="select">Kind</InputLabel>
				<Select

					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={datasetKind}
					onChange={(event)=>setDatasetKind(event.target.value)}

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
							onClick={handleAdd} disabled={(datasetKind.length===0 || datasetToAdd.length===0)}>
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
