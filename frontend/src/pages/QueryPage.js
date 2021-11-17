import Typography from "@material-ui/core/Typography";
import {Box, Button, Container, Divider, Grid, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React from "react";
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
	const handleCourseSearch =()=>{
		console.log("hi")
	}
	const handleRoomSearch =()=>{
		console.log("hi")

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
			</Grid>

		</Container>
	)
}
