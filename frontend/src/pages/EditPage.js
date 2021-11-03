import Typography from "@material-ui/core/Typography";
import {Button, Container, Divider, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
import React from "react";
const useStyles = makeStyles((theme) => ({
	title:{
		fontWeight: 500,
	},
	container:{
		paddingLeft: theme.spacing(10),
	},
}));

export default function EditPage(props){
	const [datasetToAdd, setDataSetToAdd] = React.useState('');
	const [datasetToRemove, setDataSetToRemove] = React.useState('');

	const classes = useStyles()
	return(
		<div>
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				Add dataset
			</Typography>
			<Divider/>
			<FormControl fullWidth>
				<InputLabel id="select">Select a dataset to add</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={datasetToAdd}
					label="Age"
					onChange={(event)=>setDataSetToAdd(event.target.value)}
				>
					<MenuItem value={""}>None</MenuItem>
					<MenuItem value={"courses"}>Courses</MenuItem>
					<MenuItem value={"rooms"}>Rooms</MenuItem>
				</Select>
			</FormControl>
			<Button variant="contained">
				Add Dataset
			</Button>
		</Container>
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				Remove dataset
			</Typography>
			<Divider/>
			<FormControl fullWidth>
				<InputLabel id="select">Select a dataset to remove</InputLabel>
				<Select
					labelId="demo-simple-select-label"
					id="demo-simple-select"
					value={datasetToRemove}
					label="Age"
					onChange={(event)=>setDataSetToRemove(event.target.value)}
				>
					<MenuItem value={"courses"}>Courses</MenuItem>
					<MenuItem value={"rooms"}>Rooms</MenuItem>
				</Select>
			</FormControl>
			<Button variant="contained">
				Remove Dataset
			</Button>
		</Container>
		</div>

)
}
