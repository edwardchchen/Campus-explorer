import Typography from "@material-ui/core/Typography";
import {Container} from "@material-ui/core";
import {makeStyles} from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
	title:{
		fontWeight: 500,
	},
	container:{
		paddingLeft: theme.spacing(10),
	},
}));

export default function EditPage(props){
	const classes = useStyles()
	return(
		<Container>
			<Typography align={'left'} variant="h4" className={classes.title}>
				Edit
			</Typography>
		</Container>
		)
}
