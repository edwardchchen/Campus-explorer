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
	//code taken from https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
	function base64ToArrayBuffer(base64) {
		var binary_string = window.atob(base64);
		var len = binary_string.length;
		var bytes = new Uint8Array(len);
		for (var i = 0; i < len; i++) {
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}


	const handleAdd = () => {
		let url = "http://localhost:4321/dataset/"+datasetKind+"/"+datasetKind
		let content = datasetKind === "rooms" ? rooms : courses;
		content = base64ToArrayBuffer(content);

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
				alert("Dataset already exists")
			}else{
				console.log("gg")
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
				<Grid item xs={6}>
				<FormControl fullWidth>
				<InputLabel id="select">Kind</InputLabel>
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
				<Grid item xs={3}>
					<Button className={classes.button}
							color='primary' size='medium' variant='contained'
							onClick={handleAdd} disabled={(datasetKind.length===0)}>
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
				<Grid item xs={6}>
					<FormControl fullWidth>
						<InputLabel id="select">Kind</InputLabel>
						<Select
							value={datasetToRemove}
							onChange={(event)=>setDataSetToRemove(event.target.value)}

						>
							<MenuItem value={"courses"}>Courses</MenuItem>
							<MenuItem value={"rooms"}>Rooms</MenuItem>
						</Select>
					</FormControl>
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
