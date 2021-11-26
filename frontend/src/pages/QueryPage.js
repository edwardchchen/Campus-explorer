import Typography from "@material-ui/core/Typography";
import {Box, Button, Container, Divider, Grid, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React from "react"
import {coursesQuery,roomsQuery} from "../queries";
import {Label} from "@material-ui/icons";
import {QueryTable, RoomQueryTable} from "../components/Table";
const axios = require('axios');

const useStyles = makeStyles((theme) => ({
	button:{
		marginTop: 30,
	},
}));

export default function QueryPage(props){
	let classes = useStyles();
	const [buildingName,setBuildingName] = React.useState("");
	const [roomNum,setRoomNum] = React.useState("");
	const [courseDep,setCourseDep] = React.useState("");
	const [courseYear,setCourseYear] = React.useState("");
	const [courseId,setCourseId] = React.useState("");

	const [roomResult,setRoomResult]= React.useState([]);
	const [courseResult,setCourseResult]= React.useState([]);

	const handleCourseSearch =()=>{
		let queryInJson = JSON.parse(coursesQuery);
		queryInJson.WHERE.AND[0].IS.courses_id = courseId
		queryInJson.WHERE.AND[1].IS.courses_dept = courseDep
		queryInJson.WHERE.AND[2].EQ.courses_year = parseInt(courseYear)
		axios.post('http://localhost:4321/query', queryInJson).then(res => {
			setCourseResult(res.data.result)
			console.log(res.data.result);
		}).catch(err=>{
			alert("Dataset not added, please go add dataset")
		});


	}
	const handleRoomSearch =()=>{
		let queryInJson = JSON.parse(roomsQuery);
		queryInJson.WHERE.AND[0].IS.rooms_shortname = buildingName
		queryInJson.WHERE.AND[1].IS.rooms_number = roomNum
		console.log(queryInJson)
		axios.post('http://localhost:4321/query', queryInJson).then(res => {
			setRoomResult(res.data.result)
			console.log(res.data.result);
		}).catch(err=>{
			alert("Dataset not added, please go add dataset")
		});

	}

	return(
		<Container>
			<Typography align={'left'} variant="h4"
			>
				Find course attributes
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>
					<TextField id="outlined-basic"
							   label="Year (e.g. 2014)" variant="outlined" margin="normal"
							   value={courseYear}
							   onChange={(event)=>setCourseYear(event.target.value)}
					/>
				</Grid>
				<Grid item xs={3}>

				<TextField id="outlined-basic" label="Department (e.g. cpsc)" variant="outlined" margin="normal"
						   value={courseDep}
						   onChange={(event)=>setCourseDep(event.target.value)}
				/>
				</Grid>
				<Grid item xs={3}>

				<TextField id="outlined-basic" label="ID (e.g. 310)" variant="outlined" margin="normal"
						   value={courseId}
						   onChange={(event)=>setCourseId(event.target.value)}
				/>
				</Grid>
				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium'
							disabled={courseId.length===0|| courseDep.length===0||courseYear.length===0}
							variant='contained' onClick={handleCourseSearch}>
						Submit
					</Button>
				</Grid>
				<Grid item xs={12}>
					<QueryTable result={courseResult}/>
				</Grid>
			</Grid>
			<Typography align={'left'} variant="h4">
				Find room attributes
			</Typography>
			<Divider/>
			<Grid container spacing={1}>
				<Grid item xs={3}>
					<TextField id="outlined-basic" label="Building Name (e.g. DMP)" variant="outlined"
							   margin="normal"
							   value={buildingName}
							   onChange={(event)=>setBuildingName(event.target.value)}
					/>
				</Grid>
				<Grid item xs={3}>

					<TextField id="outlined-basic"
							   value={roomNum}
							   onChange={(event)=>setRoomNum(event.target.value)}
							   label="Room number (e.g. 310)" variant="outlined" margin="normal" />
				</Grid>
				<Grid item xs={3}>
					<Button className={classes.button} color='primary' size='medium' variant='contained'
					disabled={roomNum.length===0||buildingName.length===0} onClick={handleRoomSearch}>
						Submit
					</Button>
				</Grid>
				<Grid item xs={12}>
					<RoomQueryTable result={roomResult}/>
					{/*{JSON.stringify(roomResult)}*/}
				</Grid>
			</Grid>

		</Container>
	)
}
