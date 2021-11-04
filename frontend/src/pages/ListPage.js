import Typography from "@material-ui/core/Typography";
import {Button, Container, Divider, FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

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

	return(
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				List Datasets
			</Typography>
			<Divider/>

		</Container>
	)
}
