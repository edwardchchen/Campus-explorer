import Typography from "@material-ui/core/Typography";
import {Button, Container, Divider, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect} from "react";
import DSTable from "../components/Table";
const axios = require('axios');

const useStyles = makeStyles((theme) => ({
	title:{
		fontWeight: 500,
	},
	container:{
		paddingLeft: theme.spacing(10),
	},
}));

export default function ListPage(props){
	const classes = useStyles()
	const [datasets,setDatasets] = React.useState([])

	useEffect(() => {
		axios.get('http://localhost:4321/datasets').then(res => {
			setDatasets(res.data.result)
			console.log(res.data.result);
		});
	}, []);

	return(
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				List Datasets
			</Typography>
			<Divider/>
			<DSTable datasets={datasets}/>

		</Container>
	)
}
