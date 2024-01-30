import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom';
import { Grid, Header, Input, Segment, Divider, Loader, Table, Modal, Button, Icon } from 'semantic-ui-react';
import MainMenu from '../../components/MainMenu';
import PopUpMessage from '../../components/PopupMessage';
import { apiValidateLoadCarton, apiUpdateCartonBoxCount } from '../../services/api';
import DespachoWebProgressTab from '../../components/DespachoWebProgressTab';

const LoadCartonScreen = () => {

  let history = useHistory();
  const refCartonInput = useRef(null);

  const [loading, setLoading] = useState(false);

  const [login_user_id, setUserId] = useState("");
  const [whse_name, setWhseName] = useState("");
  const [carton_nbr, setCartonNbr] = useState("");
  const [carton_history, setCartonHistory] = useState([]);
  const [multy_order, setMultyOder] = useState([]);
  const [load_info, setLoadInfo] = useState("");
  const [clicked_carton_nbr, setClickedCartonNbr] = useState("");
  const [qty, setQty] = useState(1);

  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState("");

  const rowHeight = 45; // set the height of each row in pixels
  const historyTableHeight = rowHeight * 3 + 45; // calculate the height of the table to show 3 rows 45 for header
  const orderTableHeight = rowHeight * 3 + 45 * 2; // calculate the height of the table to show 3 rows 45 for header

  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      if (carton_nbr === "") {
        setCartonNbr("");
        setError("Favor ingresar el carton a cargar.");
        setAlert(true);
      } else {
        validateCarton();
        setCartonNbr("");
      }
    }
  }

  useEffect(() => {
    var scanInfo = JSON.parse(sessionStorage.getItem("scanInfo"));
    console.log(" == scanInfo in useEffect of LoadCartonScreen= ", scanInfo)

    if (scanInfo === null || scanInfo.load_info.load_nbr === undefined) {
      history.push("/load");
    } else {
      if (scanInfo !== null && scanInfo.carton_nbr !== undefined) {
        var newInfo = {
          login_user_id: scanInfo.login_user_id,
          whse: scanInfo.whse,
          whse_name: scanInfo.whse_name,
          load_info: scanInfo.load_info,
        };
        sessionStorage.setItem("scanInfo", JSON.stringify(newInfo));
      }
      if (scanInfo !== null) {
        setUserId(scanInfo.login_user_id);
        setWhseName(scanInfo.whse_name);
        setLoadInfo(scanInfo.load_info);
        setCartonNbr(scanInfo.carton_nbr);
      }
    }

  }, [history]);

  const validateCarton = () => {

    setLoading(true);

    var scanInfo = JSON.parse(sessionStorage.getItem("scanInfo"));
    console.log('apiValidateLoadCarton', scanInfo);

    apiValidateLoadCarton({ whse: scanInfo.whse, carton_nbr: carton_nbr, trlr_nbr: scanInfo.load_info.trlr_nbr, login_user_id: scanInfo.login_user_id, load_nbr: scanInfo.load_info.load_nbr })
      .then(res => {
        console.log('===== res: ', res);
        setLoading(false);
        if (res) {
          // var scanInfo = JSON.parse(sessionStorage.getItem("scanInfo"));
          var scanInfo = res;
          console.log(" == scanInfo = ", scanInfo);
          var newObj = Object.assign({}, scanInfo);
          sessionStorage.setItem("scanInfo", JSON.stringify(newObj));

          history.push('/load_carton');

          var newArry = carton_history;
          newArry.unshift(carton_nbr);

          setCartonHistory(newArry);
          setMultyOder(res.load_info.multi_carton_pkt);
        }
      })
      .catch(function (error) {
        // Handle Errors here.
        setLoading(false);
        console.log('===== error: ', error.message);
        setError(error.message);
        setAlert(true);
        // ...
      });

  }

  const onClose = () => {
    setCartonNbr("");
    setAlert(false);
    refCartonInput.current.focus();
  }

  const updateQty = (e) => {
    console.log(e)
    if (e) {
      setQty(qty + 1);
    } else {
      if (qty > 1) {
        setQty(qty - 1);
      }
    }
  }

  const submitQty = () => {
    var scanInfo = JSON.parse(sessionStorage.getItem("scanInfo"));

    apiUpdateCartonBoxCount({ login_user_id: scanInfo.login_user_id, carton_nbr: clicked_carton_nbr, qty: qty })
      .then(res => {
        console.log('===== qty update res: ', res);
        setLoading(false);
        if (res.message === 'Ok') {

        } else {
          setError("Something Wrong!.");
          setAlert(true);
        }
      })
      .catch(function (error) {
        // Handle Errors here.
        setLoading(false);
        console.log('===== error: ', error.message);
        setError(error.message);
        setAlert(true);
        // ...
      });
  }

  return (
    <Grid centered>
      <Grid.Row></Grid.Row>
      <MainMenu />
      <Grid.Row>
        <Grid.Column width={4} />
        <Grid.Column width={8}></Grid.Column>
        <Grid.Column width={4}>
          <Header as='h5' floated='right'>{login_user_id} @ {whse_name}</Header>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        {/* <Grid.Column width={1}></Grid.Column> */}
        <Grid.Column align="center" width={8}>
          <Header align="center" as='h1'>Despacho WEB</Header>
          <DespachoWebProgressTab trailer_tab_active={true} trailer_tab_disabled={false}
            dock_door_tab_active={true} dock_door_tab_disabled={false}
            load_tab_active={true} load_tab_disabled={false}
            load_carton_tab_active={true} load_carton_tab_disabled={false}
          />
          <Segment raised align="center" verticalAlign='middle' padded='very'>
            <Input size='huge' autoFocus
              placeholder='Ingresar el Numero de Carton'
              label='Nro. Carton'
              labelPosition='left'
              ref={refCartonInput}
              value={carton_nbr}
              onChange={e => {
                setCartonNbr(e.target.value.toUpperCase().trim());
              }}
              onKeyUp={handleKeyUp}
              InputProps={{ readOnly: Boolean(loading), }}
            />
            <Divider hidden />
            {loading && <Loader active inline='centered' />}
          </Segment>
        </Grid.Column>
        <Grid.Column style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ borderLeft: '1px solid black', height: '100%' }} />
        </Grid.Column>
        <Grid.Column width={6}>
          <Segment>
            <Header as='h2' align="center" style={{ lineHeight: '.3em' }}>Carga : {load_info.load_nbr}</Header>
            <Header as='h2' align="center" style={{ lineHeight: '.3em' }}>Puerto : {load_info.dock_door_brcd}</Header>
            <Header as='h3' align="center" style={{ lineHeight: '.3em' }}>Cartones Asignados : {load_info.cartons_assigned}, </Header>
            <Header as='h3' align="center" style={{ lineHeight: '.3em' }}>Cartones cargados : {load_info.cartons_loaded}</Header>
            <Table celled selectable textAlign='center' style={{ height: `${historyTableHeight}px`, overflowY: 'scroll' }}>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Carton History</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body style={{ display: 'block', height: '100%', overflowY: 'scroll' }}>
                {
                  carton_history.length ? (
                    carton_history.map((chistory, index) => {
                      // if (chistory && index < 5) {
                      return (
                        <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                          <Table.Cell style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <a
                              href="javascript:void(0)"
                              onClick={() => {
                                setOpen(true);
                                setClickedCartonNbr(chistory);
                                setQty(1);
                              }}>
                              {chistory}
                            </a>
                          </Table.Cell>
                        </Table.Row>
                      )
                      // }
                    })
                  ) : (
                    <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed', marginTop: `${rowHeight}px` }}>
                      <Table.Cell style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        PENDING
                      </Table.Cell>
                    </Table.Row>
                  )
                }
              </Table.Body>
            </Table>

            <Table celled selectable textAlign='center' style={{ height: `${orderTableHeight}px`, overflowY: 'scroll' }}>
              <Table.Header>
                <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                  <Table.HeaderCell colSpan='2'>MULTI CARTON ORDERS</Table.HeaderCell>
                </Table.Row>
                <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                  <Table.HeaderCell>PKT</Table.HeaderCell>
                  <Table.HeaderCell>CARTONS PENDING</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body style={{ display: 'block', height: '100%', overflowY: 'scroll' }}>
                {
                  multy_order.length ? (
                    multy_order.map((order, index) => {
                      if (order) {
                        return (
                          <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                            <Table.Cell style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order[0]}</Table.Cell>
                            <Table.Cell style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order[1]}</Table.Cell>
                          </Table.Row>
                        )
                      }
                    })
                  ) : (
                    <Table.Row style={{ display: 'table', width: '100%', tableLayout: 'fixed', marginTop: `${rowHeight}px` }}>
                      <Table.Cell style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', display: 'table-cell', verticalAlign: 'middle' }}>PENDING</Table.Cell>
                    </Table.Row>
                  )
                }
              </Table.Body>
            </Table>
          </Segment>
        </Grid.Column>

        {/* <Grid.Column width={1}></Grid.Column> */}
      </Grid.Row>

      <Grid.Row>
        <PopUpMessage error={error} open={alert} onClose={() => onClose(error)} />
      </Grid.Row>

      <Grid.Row centered>
        <Modal
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          size='mini'
          style={{ textAlign: 'center' }}
        >
          <Modal.Header style={{ textAlign: 'center', margin: '0 auto' }}>Update Carton Quantity </Modal.Header>
          <Modal.Content align="center">
            <Modal.Description>
              <Header as='h4'>Load Number: {load_info.load_nbr}</Header>
              <Header as='h4'>Carton Number: {clicked_carton_nbr}</Header>
              <Segment >
                <Button circular color='red' icon='minus' onClick={() => updateQty(0)}></Button>
                <span> {qty} </span>
                <Button circular color='green' icon='add' onClick={() => updateQty(1)}></Button>
              </Segment>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button color='black' onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                content="Submit"
                labelPosition='right'
                icon='checkmark'
                onClick={() => {
                  setOpen(false);
                  submitQty();
                }}
                positive
              />
            </div>
          </Modal.Actions>
        </Modal>
      </Grid.Row>
    </Grid>
  )
}

export default LoadCartonScreen;