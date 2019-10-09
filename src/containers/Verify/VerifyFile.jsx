import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as loading from "../../components/Loading/loading.js";
import * as misc from "../../common/js/misc.js";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};

	constructor(props)
	{
		super(props);

		this.verify = React.createRef();
		this.verifyFilename = React.createRef();
		this.verifyFileForm = React.createRef();
	}

	componentDidMount()
	{
		this.props.refreshSubscribe("chain", this.refreshData, true);
		this.refreshData();
	}

	componentDidUpdate()
	{
		if(this.isDataReady())
		{
			this.handleVerifyChange();
			this.verifyInit();
		}
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("chain", this.refreshData, false);
	}

	formDataAppendFiles = (formData, fileSelect) =>
	{
		let files = fileSelect.files;
		for (let i = 0; i < files.length; i++)
		{
			let name = "file" + i;
			let file = files[i];
			formData.append(name, file, file.name);
		}

		return formData;
	};

	handleVerifyChange = (e) =>
	{
		const file = this.verify.current;
		const filename = this.verifyFilename.current;
		const fileSelected = file.value.length > 0;

		// Toggle file-selected class based on select status.
		$(file).parent().toggleClass("file-selected", fileSelected);

		if(fileSelected)
		{
			// Populate the filename field.
			filename.innerText = file.value.replace(/.*[\/\\]/, "");
		}
		else
			filename.innerText = "Choose a file, or drag it here.";
	};

	handleVerifyFileDrop = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.currentTarget).closest("form"), false);
		this.handleFileChange();

		const file = this.verify.current;
		const files = e.dataTransfer.files;

		if(files.length > 0)
		{
			file.files = files;
		}
	};

	handleFileDragLeave = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.currentTarget).closest("form"), false);
	};

	handleFileDragOver = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.currentTarget).closest("form"), true);
	};

	handleFileDrop = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.currentTarget).closest("form"), false);
		$(e.currentTarget).trigger("change");

		const file = $(e.currentTarget).find("input[type=file]").get(0);
		const files = e.dataTransfer.files;

		if(files.length > 0)
		{
			file.files = files;
		}
	};

	handleFileDragToggle = (target, isDragging) =>
	{
		$(target).toggleClass("dragging", isDragging);
	};

	handleVerifySubmitButtonClick = (e) =>
	{
		if(e) e.preventDefault();

		const _this = this;

		if(_this.verify.current.files.length === 0)
		{
			iziToast.error({title: "Error", message: "You must select a file before submitting."});
			return;
		}

		loading.show();

		const file = _this.verify.current.files[0];
		misc.hashFile(file)
		.then(function(hash)
		{
			loading.hide();

			const q = "data_hash:" + hash;
			router.navigate("search", {q});
		})
		.catch(function(error)
		{
			loading.hide();

			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	isDataReady = () =>
	{
		return _.has(mobx.toJS(this.data), "verify_chain");
	};

	updateSelectedVerifyTags = action((data) =>
	{
		this.selectedVerifyTags = data;
		log.debug("UPDATE SELECTED VERIFY TAGS:", data);
	});

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	verifyInit = () =>
	{
		this.verify.current.addEventListener("change", this.handleVerifyChange);
	};

	refreshClicked = (e) =>
	{
		e.preventDefault();

		this.refreshData(false);
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("verify"))
			return false;

		api.getUrl("/api/verify-chain")
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {verify_chain: null}, {verify_chain: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		this.updateData({});

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderVerify = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const html =
		(
			<div>
				<div className="description">
					Check a file by generating a hash in the browser and searching the blockchain for previous inclusion. No data is uploaded stored with this operation.
				</div>
				<form ref={this.verifyFileForm} action="" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit} onDrop={this.handleFileDrop} onDragOver={this.handleFileDragOver} onDragLeave={this.handleFileDragLeave} onDragExit={this.handleFileDragLeave}>
					<label className="file">
						<input ref={this.verify} type="file" name="file" />
						<i className="fas fa-file-upload"></i>
						<span ref={this.verifyFilename} className="filename"></span>
					</label>
					<div className="button-container">
						<button type="button" className="submit" onClick={this.handleVerifySubmitButtonClick} title="Verify File"><i className="far fa-save icon"></i><span>Verify</span></button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("verify-file-container", "Verify a File", html);
	};

	render()
	{
		return this.renderVerify();
	}
}

Component.defaultProps =
{
};

Component.propTypes =
{
	refreshSubscribe: PropTypes.func,
};

export default Component;
