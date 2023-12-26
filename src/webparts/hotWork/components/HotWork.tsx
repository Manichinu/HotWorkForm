import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IHotWorkProps } from './IHotWorkProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
// import * as $ from 'jquery';
// import Swal from 'sweetalert2';
import { Web } from '@pnp/sp/presets/all';
import * as moment from "moment";
import 'datatables.net';
import 'datatables.net-responsive';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.flash.min';
import 'datatables.net-buttons/js/buttons.html5.min';
import NewRequestForm from './NewRequestForm';
import HotWorkViewForm from './HotWorkViewForm';

let NewWeb = Web("https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC");
let img: any;


export interface HotWorkDashboardState {
  LoggedinuserName: string;
  CurrentUserProfilePic: string;
  CurrentUserID: number;
  DashboardItems: any[];
  ShowDashboard: boolean;
  ShowNewForm: boolean;
  ShowViewForm: boolean;
  ViewFormID: any;
  ApprovedStatusCount: number;
  PendingStatusCount: number;
}

export default class HotWork extends React.Component<IHotWorkProps, HotWorkDashboardState, {}> {
  public constructor(props: IHotWorkProps, state: HotWorkDashboardState) {
    super(props);
    this.state = {
      LoggedinuserName: "",
      CurrentUserProfilePic: "",
      CurrentUserID: 0,
      DashboardItems: [],
      ShowDashboard: true,
      ShowNewForm: false,
      ShowViewForm: false,
      ViewFormID: "",
      ApprovedStatusCount: 0,
      PendingStatusCount: 0
    };
    SPComponentLoader.loadScript(`https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js`);
    SPComponentLoader.loadCss(`https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css`);
    // NewWeb = Web(this.props.siteurl);
    img = `${this.props.siteurl}/SiteAssets/AlQasimiForms/img`;

  }
  public componentDidMount() {
    this.GetCurrentLoggedUser();
    this.getPermitRequestDetails();
    const searchParams = new URLSearchParams(window.location.search);
    const hasSessionID = searchParams.has("SessionID");
    if (hasSessionID) {
      this.setState({
        ShowDashboard: false,
        ShowNewForm: false,
        ShowViewForm: true
      })
    }
  }
  private async GetCurrentLoggedUser() {
    await NewWeb.currentUser.get().then((user: any) => {
      console.log("User", user);
      this.setState({
        CurrentUserID: user.Id,
        LoggedinuserName: user.Title,
        CurrentUserProfilePic: `${this.props.siteurl}/_layouts/15/userphoto.aspx?size=L&username=${user.Title}`
      });
    }, (errorResponse: any) => {
    });
    console.log(this.state.LoggedinuserName, this.state.CurrentUserProfilePic);
  }
  private Dropdown() {
    $(".user-profile-details").toggleClass("open");
  }
  public getPermitRequestDetails() {
    var PendingStatus = 0;
    var ApprovedStatus = 0;
    NewWeb.lists.getByTitle("Permit Request Transaction").items.orderBy("Created", false).get().then((items) => {
      console.log(items);
      for (let i = 0; i < items.length; i++) {
        if (items[i].Status == "Pending") {
          PendingStatus = PendingStatus + 1;
        }
        else if (items[i].Status == "Approved") {
          ApprovedStatus = ApprovedStatus + 1;
        }
      }
      this.setState({
        DashboardItems: items,
        ApprovedStatusCount: ApprovedStatus,
        PendingStatusCount: PendingStatus
      })
      setTimeout(() => {
        $('#SpfxDatatable').DataTable({
          dom: 'Bfrtip',
          pageLength: 10,
          buttons: [

            {
              exportOptions: {
                columns: [0, 1, 2, 3, 4, 5, 6, 7]
              }
            },
          ]
        });
        // this.loaddataTable();
      }, 1000);
    });
  }
  public async loaddataTable() {
    // var sSearchtext = 'Search :';
    var sInfotext = 'Showing _START_ to _END_ of _TOTAL_ entries';
    var sZeroRecordsText = 'No data available in table';
    var sinfoFilteredText = "(filtered from _MAX_ total records)";
    // var placeholderkeyword = "Keyword";
    var lengthMenutxt = "Show _MENU_ entries";
    var firstpage = "First";
    var Lastpage = "Last";
    var Nextpage = "Next";
    var Previouspage = "Previous";
    $.extend($.fn.dataTable, {
      responsive: true,
    });
    $("#SpfxDatatable").DataTable({
      // destroy:true,
      lengthMenu: [[5, 10, 20, 50, 100, -1], [5, 10, 20, 50, 100, "All"]],
      dom: 'Blfrtip',
      "columnDefs": [{
        orderable: false,
        responsivePriority: 0,
        target: 7,
        targets: [6],
      }
      ],
      buttons: [{
        extend: 'csvHtml5',
        text: `Export to <img class="excel_img" src='${img}/excel.svg'/>`,
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6]
        }
      }
      ],
      "info": true,
      "pagingType": 'full_numbers',
      "language": {
        "infoEmpty": sInfotext,
        "info": sInfotext,
        "zeroRecords": sZeroRecordsText,
        "infoFiltered": sinfoFilteredText,
        "lengthMenu": lengthMenutxt,
        "search": `<img class="search_img" src='${img}/search (6).svg'/>`,
        "searchPlaceholder": "Search",
        "paginate": {
          "first": firstpage,
          "last": Lastpage,
          "next": Nextpage,
          "previous": Previouspage
        }
      }
    });

  }
  public goToNewRequestForm() {
    this.setState({
      ShowNewForm: true,
      ShowDashboard: false
    });

  }
  public goToViewForm(SessionID: string) {
    this.setState({
      ViewFormID: SessionID,
      ShowDashboard: false,
      ShowNewForm: false,
      ShowViewForm: true
    })
  }
  public render(): React.ReactElement<IHotWorkProps> {
    SPComponentLoader.loadCss(`${this.props.siteurl}/SiteAssets/AlQasimiForms/css/style.css?v=1.5`);
    SPComponentLoader.loadScript(`https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js`);
    SPComponentLoader.loadCss(`https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css`);
    SPComponentLoader.loadScript(`https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`);
    // const {
    //   description,
    //   isDarkTheme,
    //   environmentMessage,
    //   hasTeamsContext,
    //   userDisplayName
    // } = this.props;


    return (
      <>
        {this.state.ShowDashboard == true &&
          <>
            <div>
              <header>
                <div className="container clearfix">
                  <div className="logo">
                    <a href="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SitePages/HotWorkForm.aspx?env=WebView"> <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/Logo.png`} alt="image" /> </a>
                  </div>
                  <div className="notification-part">
                    <ul>
                      <li> <a href="#"> <img className="user_img" src={`${this.state.CurrentUserProfilePic}`} alt="image" /> </a> </li>
                      <li> <span> {this.state.LoggedinuserName} </span> </li>
                      <li> <a href="#"> <img className="next_img" src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/dropdown.svg`} onClick={this.Dropdown} alt="image" /> </a> </li>
                    </ul>
                    <div className="user-profile-details"><h3>  {this.state.LoggedinuserName} </h3>
                      <div className="logou-bck"><a href="https://login.windows.net/common/oauth2/logout" data-interception="off">
                        <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/logout_img.svg`} data-themekey="#" />Logout </a>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            </div>
            <section>
              <div className="container">
                <div className="dashboard-wrap">
                  <div className="heading-block clearfix">
                    <h2> Dashboard </h2>
                    <p className="purchase_btn" onClick={() => this.goToNewRequestForm()}>Create New Request</p>
                  </div>


                  <div className="three-blocks-wrap">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="three-blocks">
                          <div className="three-blocks-img">
                            <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/Approved.svg`} alt="image" />
                          </div>
                          <div className="three-blocks-desc">
                            <h3>{this.state.ApprovedStatusCount}</h3>
                            <p> Total Completed </p>
                          </div>

                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="three-blocks">
                          <div className="three-blocks-img">
                            <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/pending.svg`} alt="image" />
                          </div>
                          <div className="three-blocks-desc">
                            <h3>{this.state.PendingStatusCount}</h3>
                            <p> Total Pending </p>
                          </div>

                        </div>
                      </div>
                      {/* <div className="col-md-4">
                                                <div className="three-blocks">
                                                    <div className="three-blocks-img">
                                                        <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/rejected.svg`} alt="image" />
                                                    </div>
                                                    <div className="three-blocks-desc">
                                                        <h3> 02 </h3>
                                                        <p> Total Rejected </p>
                                                    </div>
                                                </div>
                                            </div> */}
                    </div>
                  </div>
                  <div className="table-wrap">
                    <div className="table-responsive">
                      <table className="table dashboard_table" id='SpfxDatatable'>
                        <thead>
                          <tr>
                            <th className="s_no"> S.No </th>
                            <th className="name"> Name </th>
                            <th className="dept-name"> Department </th>
                            <th className="Purpose"> Work Title</th>
                            <th className="Purpose"> Request ID</th>
                            <th className="Purpose">Requested On</th>
                            <th className="text-center status"> Status  </th>
                            <th className="text-center action_th"> Action  </th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.DashboardItems && this.state.DashboardItems.map((item, i) => {
                            return [
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{item.Name}</td>
                                <td>{item.Section}</td>
                                <td>{item.WorkTitle}</td>
                                <td>{item.RequestID}</td>
                                <td>{moment(item.Created).format('DD/MM/YYYY h:mm A')}</td>
                                <td className={`text-center status ${item.Status}`} >
                                  <span>{item.Status}</span>
                                </td>
                                <td className='text-center'><a href='#' title='View Request'>
                                  <img className="view_img" onClick={() => this.goToViewForm(item.RequestID)} src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/view.svg`} alt="image" /> </a>
                                </td>
                              </tr>
                            ];
                          })
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>


                </div>
              </div>
            </section>
          </>
        }
        {this.state.ShowNewForm == true &&
          <NewRequestForm
            itemId={0}
            description={''}
            context={this.props.context}
            siteurl={this.props.siteurl} isDarkTheme={false} environmentMessage={''} hasTeamsContext={false} userDisplayName={''}
          />
        }
        {this.state.ShowViewForm == true &&
          <HotWorkViewForm
            itemId={this.state.ViewFormID}
            description={''}
            context={this.props.context}
            siteurl={this.props.siteurl} isDarkTheme={false} environmentMessage={''} hasTeamsContext={false} userDisplayName={''}
          />
        }

      </>
    );
  }
}
