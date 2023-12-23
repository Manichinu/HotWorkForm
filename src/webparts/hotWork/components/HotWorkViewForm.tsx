import * as React from 'react';
// import styles from './HotWork.module.scss';
import type { IHotWorkProps } from './IHotWorkProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { SPComponentLoader } from '@microsoft/sp-loader';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { Web } from '@pnp/sp/presets/all';
import * as moment from "moment";
import HotWork from './HotWork';
// import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";


let NewWeb = Web("https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC");
let RequestID = "";
var UniqueID: any;
var WFRequestID: any;
var WFItemID: any;
var Level: any;
var SessionID: any;
var WFStatus: any;

export interface HotWorkState {
    currentPage: number;
    itemsPerPage: number;
    LoggedinuserName: string;
    CurrentUserProfilePic: string;
    CurrentUserID: number;
    ApproverID: any;
    ShowDashboard: boolean;
    ShowViewForm: boolean;
    Section1Table: any[];
}

export default class HotWorkViewForm extends React.Component<IHotWorkProps, HotWorkState, {}> {
    public constructor(props: IHotWorkProps, state: HotWorkState) {
        super(props);
        this.state = {
            currentPage: 1,
            itemsPerPage: 1,
            LoggedinuserName: "",
            CurrentUserProfilePic: "",
            CurrentUserID: 0,
            ApproverID: 0,
            ShowDashboard: false,
            ShowViewForm: true,
            Section1Table: []
        };
        SessionID = this.props.itemId;
        // NewWeb = Web(this.props.siteurl);
    }
    public componentDidMount() {
        const searchParams = new URLSearchParams(window.location.search);
        const hasSessionID = searchParams.has("SessionID");
        if (hasSessionID) {
            SessionID = searchParams.get("SessionID");
            console.log(SessionID);
        } else {
            console.log(SessionID);
        }

        this.GetCurrentLoggedUser();
        $(".cancel_btn").on('click', function () {
            location.reload();
        })
    }
    public getWorkflowHistory() {
        NewWeb.lists.getByTitle("HotWork Workflow History").items.filter(`RequestID eq '${SessionID}'`).top(1).orderBy("Id", false).get().then((items) => {
            if (items.length != 0) {
                console.log(items)
                Level = items[0].Level;
                WFRequestID = items[0].RequestID;
                WFItemID = items[0].ID;
                RequestID = items[0].RequestID;
                WFStatus = items[0].Status;
                this.setState({
                    currentPage: Level
                })
                this.getPermitRequestTransaction(WFRequestID)
                if (this.state.CurrentUserID == items[0].AssignedToId) {
                    $('input, input[type="radio"],textarea,button').prop({ readonly: true, disabled: true });
                    $(`.section${Level} input, .section${Level} input[type="radio"],.section${Level} textarea,.section${Level} button`).prop({ readonly: false, disabled: false });
                    if (Level == 8 && items[0].Status == "Approved") {
                        this.setState({
                            currentPage: 1
                        })
                        $('input, input[type="radio"],textarea,button').prop({ readonly: true, disabled: true });
                    }

                } else {
                    $('input, input[type="radio"],textarea,button').prop({ readonly: true, disabled: true });
                }
            } else {
                $('input, input[type="radio"],textarea,button').prop({ readonly: true, disabled: true });
            }
        }).then(() => {
            this.getTableDetails(WFRequestID);
            this.getApproverListDetails();
            this.getFilesFromLibrary();
        })

    }
    public getApproverListDetails() {
        NewWeb.lists.getByTitle("Approver Master").items.get().then((items) => {
            console.log("Approver", items)
            var Levels = Level + 1;
            var ApproverLevel = items[0][`Level${Levels}ApproverId`];
            if (Level == undefined) {
                this.setState({
                    ApproverID: items[0].Level2ApproverId
                })
            }
            else {
                this.setState({
                    ApproverID: ApproverLevel
                })
            }
            console.log(this.state.ApproverID)
        })
    }
    public getPermitRequestTransaction(Requestid: any) {
        NewWeb.lists.getByTitle("Permit Request Transaction").items.filter(`RequestID eq '${Requestid}'`).get().then((items) => {
            console.log(items);
            UniqueID = items[0].ID;
            $("#work_nature").val(items[0].NatureofWork);
            $("#work_title").val(items[0].WorkTitle);
            $("#start_date").val(items[0].StartDate);
            $("#end_date").val(items[0].EndDate);
            $("#equipment_description").val(items[0].EquipmentDescription);
            $("#hazardous_description").val(items[0].HazardousAreaclassification);
            $("#work_description").val(items[0].DescriptionofWork);
            $("#tools").val(items[0].Toolstobeused);
            $("#source_ignition").val(items[0].SourceofIgnition);
            $("#hazardous_materials").val(items[0].HazardousMaterialsInvolved);
            $("#job_performer").val(items[0].JobPerformer);
            $("#section").val(items[0].Section);
            $("#name").val(items[0].Name);
            $("#no_of_workers").val(items[0].PlannedNoofWorkers);
            items[0].Contractor == true ? $("#contractor1").prop("checked", true) : $("#contractor2").prop("checked", true);
            items[0].WorkPlanning == true ? $("#planned1").prop("checked", true) : $("#planned2").prop("checked", true);
            items[0].JSA == true ? $("#L2").prop("checked", true) : $("#fra").prop("checked", true);
            items[0].RemoteFieldOperation == true ? $("#rfo1").prop("checked", true) : $("#rfo2").prop("checked", true);
            items[0].PlannedSIMOPS == true ? $("#ops1").prop("checked", true) : $("#ops2").prop("checked", true);
            items[0].PAWorksitepresence == true ? $("#pa1").prop("checked", true) : $("#pa2").prop("checked", true);
            $("#precaution").val(items[0].SpecialPrecautions);
            $("#pa_validity").val(items[0].PAValidity);
            $("#pa_note").val(items[0].PANote);
            items[0].ZeroEnergyDemonstration == true ? $("#energy1").prop("checked", true) : $("#energy2").prop("checked", true);
            items[0].AuthorizationDelegation == true ? $("#delegation1").prop("checked", true) : $("#delegation2").prop("checked", true);
            $("#permit_validity").val(items[0].PermitValidity);
            $("#permit_note").val(items[0].PermitNote);
            $("#permit_valid_from").val(items[0].PermitValidFrom);
            $("#permit_valid_till").val(items[0].PermitValidTill);
            items[0].PRWorksite == true ? $("#worksite1").prop("checked", true) : $("#worksite2").prop("checked", true);
            items[0].PRHousekeeping == true ? $("#housekeeping1").prop("checked", true) : $("#housekeeping2").prop("checked", true);
            items[0].PREquipmentLeft == true ? $("#equipment1").prop("checked", true) : $("#equipment2").prop("checked", true);
            items[0].PREquipmentReady == true ? $("#service1").prop("checked", true) : $("#service2").prop("checked", true);
            items[0].PRWorkComplete == true ? $("#work1").prop("checked", true) : $("#work2").prop("checked", true);
            items[0].PRPermitCancelled == true ? $("#permit1").prop("checked", true) : $("#permit2").prop("checked", true);
            items[0].PCWorksite == true ? $("#worksites1").prop("checked", true) : $("#worksites2").prop("checked", true);
            items[0].PCHousekeeping == true ? $("#housekeepings1").prop("checked", true) : $("#housekeepings2").prop("checked", true);
            items[0].PCEquipmentLeft == true ? $("#equipments1").prop("checked", true) : $("#equipments2").prop("checked", true);
            $("#permit_no").val(items[0].PCPermitNo)
        }).then(() => {
            if (Level != 8 && WFStatus != "Approved") {
                for (var i = Level; i < 9; i++) {
                    $(".section" + i + " input[type='radio']").prop("checked", false);
                }
            }
        });
    }
    private async GetCurrentLoggedUser() {
        await NewWeb.currentUser.get().then((user: any) => {
            console.log("User", user);
            this.setState({
                CurrentUserID: user.Id,
                LoggedinuserName: user.Title,
                CurrentUserProfilePic: `${this.props.siteurl}/_layouts/15/userphoto.aspx?size=L&username=${user.Title}`
            });
            this.getWorkflowHistory();
        }, (errorResponse: any) => {
        });
        console.log(this.state.LoggedinuserName, this.state.CurrentUserProfilePic);
    }
    private Dropdown() {
        $(".user-profile-details").addClass("open");
    }
    public addNewRow(Section: string) {
        if (Section == "Level1Table") {
            $("#work_permit_tbody").append(`
    <tr>
      <td><input type='text' id='Work_permit_name' /></td>
      <td><input type='text' id='Work_permit_company' /></td>
      <td><input type='text' id='Work_permit_position'/></td>
      <td><input type='datetime-local' id='Work_permit_date'/></td>
       </tr>
     `);
            // $("#work_permit_tbody").on("click", ".delete-icon", function (eve) {
            //   const rowCount = $("#work_permit_tbody tr").length;
            //   if (rowCount === 1) {
            //     Swal.fire({
            //       title: 'Table must have at least one row',
            //       icon: 'error',
            //       showCancelButton: false,
            //       confirmButtonText: 'Ok',
            //     });
            //     return; // Exit the function without saving
            //   } else {
            //     Swal.fire({
            //       title: 'Are you sure,you want to delete?', showConfirmButton: true,
            //       showCancelButton: true, confirmButtonText: 'Delete',
            //     }).then(async (result) => {
            //       if (result.isConfirmed) {
            //         $(this).closest("tr").remove();
            //         Swal.fire('Deleted Successfully!', '', 'success');
            //       }
            //     });
            //   }
            // });
        }
        if (Section == "Level2Table") {
            $("#worksite_permit_tbody").append(`
      <tr>
      <td><input type='text' id='worksite_permit_name' /></td>
      <td><input type='text' id='worksite_permit_company' /></td>
      <td><input type='text' id='worksite_permit_position' /></td>
      <td><input type='datetime-local' id='worksite_permit_date' /></td>
         </tr>
       `);
        }
        if (Section == "Level3Table") {
            $("#permit_endorsement_tbody").append(`
      <tr>
      <td><input type='text' id='permit_endorsement_name' /></td>
      <td><input type='text' id='permit_endorsement_company' /></td>
      <td><input type='text' id='permit_endorsement_position' /></td>
      <td><input type='datetime-local' id='permit_endorsement_date' /></td>
         </tr>
       `);
        }
        if (Section == "Level4Table") {
            $("#permit_approval_tbody").append(`
      <tr>
      <td><input type='text' id='permit_approval_name' /></td>
      <td><input type='text' id='permit_approval_company' /></td>
      <td><input type='text' id='permit_approval_position' /></td>
      <td><input type='datetime-local' id='permit_approval_date' /></td>
         </tr>
       `);
        }
        if (Section == "Level5Table") {
            $("#hse_department_tbody").append(`
      <tr>
      <td><input type='text' id='hse_department_name' /></td>
      <td><input type='text' id='hse_department_company' /></td>
      <td><input type='text' id='hse_department_position' /></td>
      <td><input type='datetime-local' id='hse_department_date' /></td>
         </tr>
       `);
        }
        if (Section == "Level6Table") {
            $("#permit_authorization_tbody").append(`
      <tr>
      <td><input type='text' id='permit_authorization_name' /></td>
      <td><input type='text' id='permit_authorization_company' /></td>
      <td><input type='text' id='permit_authorization_postion' /></td>
      <td><input type='datetime-local' id='permit_authorization_date' /></td>
         </tr>
       `);
        }
        if (Section == "Level7Table") {
            $("#worksite_timings_tbody").append(`
      <tr>
      <td><input type='date' id='worksite_date' /></td>
      <td><input type='text' id='shift' /></td>
      <td><input type='datetime-local' id='time_from' /></td>
      <td><input type='datetime-local' id='time_to' /></td>
      <td><input type='text' id='aa_name' /></td>
      <td><input type='text' id='pi_time' /></td>
      <td><input type='text' id='pi_name' /></td>
      <td><input type='text' id='jp_time' /></td>
      <td><input type='text' id='jp_name' /></td>
      <td><input type='text' id='permit_jp_time' /></td>
      <td><input type='text' id='permit_jp_name' /></td>
      <td><input type='text' id='permit_aa_time' /></td>
      <td><input type='text' id='permit_aa_name' /></td>
         </tr>
       `);
        }
        if (Section == "Level8Table") {
            $("#permit_return_tbody").append(`
      <tr>
      <td><input type='text' id='permit_return_name' /></td>
      <td><input type='text' id='permit_return_company' /></td>
      <td><input type='text' id='permit_return_position' /></td>
      <td><input type='datetime-local' id='permit_return_date' /></td>
         </tr>
       `);
        }
    }
    public saveDetails(CurrentSection: string) {
        if (RequestID == "") {
            RequestID = "Session-" + moment().format("DDMMYYYYHHmmss");
        }
        this.updateWorkFlowHistory();
        if (CurrentSection == "Section1") {
            this.savePermitRequestDetails();
            this.saveLocationEquipmentDetails();
            this.saveWorkPermitRequestDetails();
        }
        if (CurrentSection == "Section2") {
            this.saveWorkSiteControlDetails();
            this.fileUploadForWorksiteControl();
            this.fileUploadForWorksiteAttachments();
        }
        if (CurrentSection == "Section3") {
            this.savePermitEndorsementDetails();
        }
        if (CurrentSection == "Section4") {
            this.savePermitApprovalDetails();
        }
        if (CurrentSection == "Section5") {
            this.saveHSEDepartmentDetails();
        }
        if (CurrentSection == "Section6") {
            this.savePermitAuthorizationDetails();
        }
        if (CurrentSection == "Section7") {
            this.saveWorksiteIssueDetails();
        }
        if (CurrentSection == "Section8") {
            this.savePermitReturnDetails();
            this.savePermitClosureDetails();
        }
    }
    public savePermitRequestDetails() {
        var Contractor = $("#contractor1").prop("checked");
        var WorkPlanning = $("#planned1").prop("checked");

        NewWeb.lists.getByTitle("Permit Request Transaction").items.add({
            Title: "Form",
            NatureofWork: $("#work_nature").val(),
            WorkTitle: $("#work_title").val(),
            StartDate: $("#start_date").val(),
            EndDate: $("#end_date").val(),
            EquipmentDescription: $("#equipment_description").val(),
            HazardousAreaclassification: $("#hazardous_description").val(),
            DescriptionofWork: $("#work_description").val(),
            Toolstobeused: $("#tools").val(),
            SourceofIgnition: $("#source_ignition").val(),
            HazardousMaterialsInvolved: $("#hazardous_materials").val(),
            JobPerformer: $("#job_performer").val(),
            Section: $("#section").val(),
            Name: $("#name").val(),
            PlannedNoofWorkers: $("#no_of_workers").val(),
            Contractor: Contractor,
            WorkPlanning: WorkPlanning,
            RequestID: RequestID,
        }).then(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        })
    }
    public saveLocationEquipmentDetails() {
        $("#permit_request_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Request Table Transaction").items.add({
                Title: $(this).find('.location').text(),
                LocationValue: $(this).find('.location_value').val(),
                Area: $(this).find('.area').text(),
                ProcessR: $(this).find(".process_r").prop('checked'),
                ProcessA: $(this).find(".process_a").prop('checked'),
                Non_x002d_ProcessY: $(this).find(".non_process_y").prop('checked'),
                Non_x002d_ProcessG: $(this).find(".non_process_g").prop('checked'),
                Non_x002d_ProcessNC: $(this).find(".non_process_nc").prop('checked'),
                RequestID: RequestID,
                OrderNo: i
            });
        })
    }
    public saveWorkPermitRequestDetails() {
        $("#work_permit_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Work Permit Request Transaction").items.add({
                Title: $(this).find('#Work_permit_name').val(),
                Company: $(this).find('#Work_permit_company').val(),
                Position: $(this).find('#Work_permit_position').val(),
                Date: $(this).find('#Work_permit_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
    }
    public saveWorkSiteControlDetails() {
        $("#worksite_permit_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("WorkSite Control Table Transaction").items.add({
                Title: $(this).find('#worksite_permit_name').val(),
                Company: $(this).find('#worksite_permit_company').val(),
                Position: $(this).find('#worksite_permit_position').val(),
                Date: $(this).find('#worksite_permit_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        var JSA = $("#L2").prop("checked");
        var RemoteFieldOperation = $("#rfo1").prop("checked");
        var PlannedSimops = $("#ops1").prop("checked");
        var PAWorksitePresence = $("#pa1").prop("checked");
        NewWeb.lists.getByTitle("Permit Request Transaction").items.getById(UniqueID).update({
            JSA: JSA,
            RemoteFieldOperation: RemoteFieldOperation,
            PlannedSIMOPS: PlannedSimops,
            PAWorksitepresence: PAWorksitePresence,
            SpecialPrecautions: $("#precaution").val(),
        }).then(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        })
    }
    public savePermitEndorsementDetails() {
        $("#permit_endorsement_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Endorsement Transaction").items.add({
                Title: $(this).find('#permit_endorsement_name').val(),
                Company: $(this).find('#permit_endorsement_company').val(),
                Position: $(this).find('#permit_endorsement_position').val(),
                Date: $(this).find('#permit_endorsement_date').val(),
                RequestID: RequestID,
                OrderNo: i
            })
        })
        setTimeout(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        }, 500)
    }
    public savePermitApprovalDetails() {
        $("#permit_approval_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Approval Table Transaction").items.add({
                Title: $(this).find('#permit_approval_name').val(),
                Company: $(this).find('#permit_approval_company').val(),
                Position: $(this).find('#permit_approval_position').val(),
                Date: $(this).find('#permit_approval_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        NewWeb.lists.getByTitle("Permit Request Transaction").items.getById(UniqueID).update({
            PAValidity: $("#pa_validity").val(),
            PANote: $("#pa_note").val(),
        }).then(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        })
    }
    public saveHSEDepartmentDetails() {
        $("#hse_department_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("HSE Department Table Transaction").items.add({
                Title: $(this).find('#hse_department_name').val(),
                Company: $(this).find('#hse_department_company').val(),
                Position: $(this).find('#hse_department_position').val(),
                Date: $(this).find('#hse_department_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        setTimeout(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        }, 500)
    }
    public savePermitAuthorizationDetails() {
        $("#permit_authorization_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Authorization Table Transaction").items.add({
                Title: $(this).find('#permit_authorization_name').val(),
                Company: $(this).find('#permit_authorization_company').val(),
                Position: $(this).find('#permit_authorization_position').val(),
                Date: $(this).find('#permit_authorization_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        var ZeroEnergy = $("#energy1").prop("checked");
        var Delegation = $("#delegation1").prop("checked");
        NewWeb.lists.getByTitle("Permit Request Transaction").items.getById(UniqueID).update({
            ZeroEnergyDemonstration: ZeroEnergy,
            AuthorizationDelegation: Delegation,
            PermitValidity: $("#permit_validity").val(),
            PermitNote: $("#permit_note").val(),
            PermitValidFrom: $("#permit_valid_from").val(),
            PermitValidTill: $("#permit_valid_till").val(),
        }).then(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        })
    }
    public saveWorksiteIssueDetails() {
        $("#worksite_timings_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Worksite Issue Table Transaction").items.add({
                Title: "",
                Date: $(this).find('#worksite_date').val(),
                Shift: $(this).find('#shift').val(),
                TimeFrom: $(this).find('#time_from').val(),
                TimeTo: $(this).find('#time_to').val(),
                AAName: $(this).find('#aa_name').val(),
                PITime: $(this).find('#pi_time').val(),
                PIName: $(this).find('#pi_name').val(),
                JPTime: $(this).find('#jp_time').val(),
                JPName: $(this).find('#jp_name').val(),
                PermitJPTime: $(this).find('#permit_jp_time').val(),
                PermitJPName: $(this).find('#permit_jp_name').val(),
                PermitAATime: $(this).find('#permit_aa_time').val(),
                PermitAAName: $(this).find('#permit_aa_name').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        setTimeout(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        }, 500)
    }
    public savePermitReturnDetails() {
        $("#permit_return_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Return Table Transaction").items.add({
                Title: $(this).find('#permit_return_name').val(),
                Company: $(this).find('#permit_return_company').val(),
                Position: $(this).find('#permit_return_position').val(),
                Date: $(this).find('#permit_return_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
        var PRWorksite = $("#worksite1").prop("checked");
        var PRHousekeeping = $("#housekeeping1").prop("checked");
        var PREquipmentLeft = $("#equipment1").prop("checked");
        var PREquipmentReady = $("#service1").prop("checked");
        var PRWorkComplete = $("#work1").prop("checked");
        var PRPermitCancelled = $("#permit1").prop("checked");
        var PCWorksite = $("#worksites1").prop("checked");
        var PCHousekeeping = $("#housekeepings1").prop("checked");
        var PCEquipmentLeft = $("#equipments1").prop("checked");
        NewWeb.lists.getByTitle("Permit Request Transaction").items.getById(UniqueID).update({
            PRWorksite: PRWorksite,
            PRHousekeeping: PRHousekeeping,
            PREquipmentLeft: PREquipmentLeft,
            PREquipmentReady: PREquipmentReady,
            PRWorkComplete: PRWorkComplete,
            PRPermitCancelled: PRPermitCancelled,
            PCWorksite: PCWorksite,
            PCHousekeeping: PCHousekeeping,
            PCEquipmentLeft: PCEquipmentLeft,
            PCPermitNo: $("#permit_no").val(),
            Status: "Approved"
        }).then(() => {
            Swal.fire('Submitted successfully!', '', 'success').then(() => {
                location.reload();
            })
        })
    }
    public savePermitClosureDetails() {
        $("#permit_closure_tbody tr").each(function (i, J) {
            NewWeb.lists.getByTitle("Permit Closure Table Transaction").items.add({
                Title: $(this).find('#permit_closure_name').val(),
                Role: $(this).find('.roles').text(),
                Company: $(this).find('#permit_closure_company').val(),
                Position: $(this).find('#permit_closure_position').val(),
                Date: $(this).find('#permit_closure_date').val(),
                RequestID: RequestID,
                OrderNo: i
            });
        })
    }
    public fileUploadForWorksiteControl() {
        var handler = this;
        $("#worksite_tbody tr").each(function (i, row) {
            var fileInput: any = $(this).find(".certificate_files");
            if (fileInput && fileInput[0]) {
                var FileLength: any = fileInput[0].files.length;
                console.log(FileLength);
                if (FileLength != 0) {
                    var selectedFile: any = fileInput[0].files[0];
                    var FileName = selectedFile.name;
                    var Category = $(this).find(".worksite").text();
                    var Required = $(this).find(".required").prop('checked');
                    var FileNo = $(this).find(".file_no").val();
                    console.log(Required)
                    handler.uploadCertificatesFile(FileName, selectedFile, Category, Required, FileNo, i);
                }
            }
        });
    }
    private async uploadCertificatesFile(FileName: string, selectedFile: any, Category: string, Required: boolean, FileNo: any, OrderNo: number) {
        try {
            const data = await NewWeb.getFolderByServerRelativeUrl(
                this.props.context.pageContext.web.serverRelativeUrl + `/Worksite Control Attachments`
            ).files.add(FileName, selectedFile, true);
            const item = await data.file.getItem();
            await item.update({
                RequestID: RequestID,
                Category: Category,
                Required: Required,
                No: FileNo,
                OrderNo: OrderNo,
                FileType: "Certificates"
            });
            console.log("Success");
        } catch (error) {
            throw error;
        }
    }
    public fileUploadForWorksiteAttachments() {
        var handler = this;
        $("#worksite_Attachments_tbody tr").each(function (i, row) {
            var fileInput: any = $(this).find(".attach_files");
            if (fileInput && fileInput[0]) {
                var FileLength: any = fileInput[0].files.length;
                console.log(FileLength);
                if (FileLength != 0) {
                    var selectedFile: any = fileInput[0].files[0];
                    var FileName = selectedFile.name;
                    var Category = $(this).find(".worksitess").text();
                    var Required = $(this).find(".attch_req").prop('checked');
                    var FileNo = $(this).find(".attch_no").val();
                    console.log(Required)
                    handler.uploadAttachmentsFile(FileName, selectedFile, Category, Required, FileNo, i);
                }
            }
        });
    }
    private async uploadAttachmentsFile(FileName: string, selectedFile: any, Category: string, Required: boolean, FileNo: any, OrderNo: number) {
        try {
            const data = await NewWeb.getFolderByServerRelativeUrl(
                this.props.context.pageContext.web.serverRelativeUrl + `/Worksite Control Attachments`
            ).files.add(FileName, selectedFile, true);
            const item = await data.file.getItem();
            await item.update({
                RequestID: RequestID,
                Category: Category,
                Required: Required,
                No: FileNo,
                OrderNo: OrderNo,
                FileType: "Attachments"
            });
            console.log("Success");
        } catch (error) {
            throw error;
        }
    }
    public updateWorkFlowHistory() {
        if (WFItemID != undefined) {
            NewWeb.lists.getByTitle("HotWork Workflow History").items.getById(WFItemID).update({
                Status: "Approved",
                ApprovedById: this.state.CurrentUserID
            }).then(() => {
                if (Level <= 7) {
                    NewWeb.lists.getByTitle("HotWork Workflow History").items.add({
                        Title: "User",
                        Level: parseInt(Level) + 1,
                        AssignedToId: this.state.ApproverID,
                        AssignedById: this.state.CurrentUserID,
                        Status: "In Progress",
                        RequestID: RequestID
                    })
                }
            })
        } else {
            NewWeb.lists.getByTitle("HotWork Workflow History").items.add({
                Title: "User",
                Level: 1,
                AssignedToId: this.state.CurrentUserID,
                Status: "Approved",
                RequestID: RequestID
            }).then(() => {
                NewWeb.lists.getByTitle("HotWork Workflow History").items.add({
                    Title: "User",
                    Level: 2,
                    AssignedToId: this.state.ApproverID,
                    AssignedById: this.state.CurrentUserID,
                    Status: "In Progress",
                    RequestID: RequestID
                })
            })
        }

    }
    public displayFileName(e: any, row: any) {
        var File = e.target;
        var selectedFileNames = [];
        for (var i = 0; i < File.files.length; i++) {
            selectedFileNames.push(File.files[i].name);
        }
        $("#row_" + row + "").text(selectedFileNames.join(', '));
    }
    public displayAttachmentsFileName(e: any, row: any) {
        var File = e.target;
        var selectedFileNames = [];
        for (var i = 0; i < File.files.length; i++) {
            selectedFileNames.push(File.files[i].name);
        }
        $("#rows_" + row + "").text(selectedFileNames.join(', '));
    }
    public gotToDashboard() {
        this.setState({
            ShowDashboard: true,
            ShowViewForm: false
        })
    }
    public async getFilesFromLibrary() {
        await NewWeb.lists.getByTitle('Worksite Control Attachments')
            .items
            .select('*')
            .filter(`RequestID eq '${SessionID}'`)
            .orderBy("OrderNo", true)
            .expand("File")
            .get()
            .then((files) => {
                if (files.length != 0) {
                    $("#worksite_tbody").empty();
                    $("#worksite_Attachments_tbody").empty();
                    for (var i = 0; i < files.length; i++) {
                        if (files[i].FileType == "Certificates") {
                            $("#worksite_tbody").append(`<tr>
                            <td><p className='worksite'>${files[i].Category}</p></td>
                            <td><input type='checkbox' disabled className='required' ${files[i].Required == true ? 'checked' : ''} /></td>
                            <td><input type='text' readonly className='file_no' value='${files[i].No}' /></td>
                            <td><a href='${files[i].File.ServerRelativeUrl}' target='_blank'>${files[i].File.Name}</a></td>
                            </tr>`)
                        } else {
                            $("#worksite_Attachments_tbody").append(`<tr>
                            <td><p className='worksitess'>${files[i].Category}</p></td>
                            <td><input type='checkbox' disabled className='attch_req' ${files[i].Required == true ? 'checked' : ''} /></td>
                            <td><input type='text' readonly className='attch_no' value='${files[i].No}' /></td>
                            <td><a href='${files[i].File.ServerRelativeUrl}' target='_blank'>${files[i].File.Name}</a></td>
                            </tr>`)
                        }
                    }
                }
            })
    }
    public getTableDetails(Requestid: string) {
        NewWeb.lists.getByTitle("Work Permit Request Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            console.log(items);
            if (items.length != 0) {
                $("#work_permit_tbody").empty();
                for (var i = 0; i < items.length; i++) {
                    $("#work_permit_tbody").append(`<tr>
                    <td><input type='text' id='work_permit_name' value='${items[i].Title}' readonly  /></td>
                    <td><input type='text' id='work_permit_company' value='${items[i].Company}' readonly  /></td>
                    <td><input type='text' id='work_permit_position' value='${items[i].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='work_permit_date' value='${items[i].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Request Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            console.log(items);
            if (items.length != 0) {
                $("#permit_request_tbody").empty();
                for (var m = 0; m < items.length; m++) {
                    if (m == 0) {
                        $("#permit_request_tbody").append(`<tr>
                    <td><p className='location'>${items[m].Title}</p></td>
                    <td><input readonly type='text' className='location_value' value='${items[m].LocationValue}' /></td>
                    <td><p className='area'>${items[m].Area}</p></td>
                    <td>R</td>
                    <td><input disabled type='checkbox' className='process_r' ${items[m].ProcessR == true ? 'checked' : ''} /></td>
                    <td>A</td>
                    <td><input disabled type='checkbox' className='process_a' ${items[m].ProcessA == true ? 'checked' : ''} /></td>
                    <td>Y</td>
                    <td><input disabled type='checkbox' className='non_process_y' ${items[m].Non_x002d_ProcessY == true ? 'checked' : ''} /></td>
                    <td>G</td>
                    <td><input disabled type='checkbox' className='non_process_g' ${items[m].Non_x002d_ProcessG == true ? 'checked' : ''} /></td>
                    <td>NC</td>
                    <td><input disabled type='checkbox' className='non_process_nc' ${items[m].Non_x002d_ProcessNC == true ? 'checked' : ''} /></td>
                </tr>`)
                    } else {
                        $("#permit_request_tbody").append(`<tr>
                        <td><p className='location'>${items[m].Title}</p></td>
                        <td><input readonly type='text' className='location_value' value='${items[m].LocationValue}' /></td>
                        <td><p className='area'>${items[m].Area}</p></td>
                        <td>0</td>
                        <td><input disabled type='checkbox' className='process_r' ${items[m].ProcessR == true ? 'checked' : ''} /></td>
                        <td>1</td>
                        <td><input disabled type='checkbox' className='process_a' ${items[m].ProcessA == true ? 'checked' : ''} /></td>
                        <td>2</td>
                        <td><input disabled type='checkbox' className='non_process_y' ${items[m].Non_x002d_ProcessY == true ? 'checked' : ''} /></td>
                        <td>G</td>
                        <td><input disabled type='checkbox' className='non_process_g' ${items[m].Non_x002d_ProcessG == true ? 'checked' : ''} /></td>
                        <td>NC</td>
                        <td><input disabled type='checkbox' className='non_process_nc' ${items[m].Non_x002d_ProcessNC == true ? 'checked' : ''} /></td>
                </tr>`)
                    }
                }
            }
        });
        NewWeb.lists.getByTitle("WorkSite Control Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#worksite_permit_tbody").empty();
                for (var a = 0; a < items.length; a++) {
                    $("#worksite_permit_tbody").append(`<tr>
                    <td><input type='text' id='worksite_permit_name' value='${items[a].Title}' readonly  /></td>
                    <td><input type='text' id='worksite_permit_company' value='${items[a].Company}' readonly  /></td>
                    <td><input type='text' id='worksite_permit_position' value='${items[a].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='worksite_permit_date' value='${items[a].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Endorsement Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#permit_endorsement_tbody").empty();
                for (var b = 0; b < items.length; b++) {
                    $("#permit_endorsement_tbody").append(`<tr>
                    <td><input type='text' id='permit_endorsement_name' value='${items[b].Title}' readonly  /></td>
                    <td><input type='text' id='permit_endorsement_company' value='${items[b].Company}' readonly  /></td>
                    <td><input type='text' id='permit_endorsement_position' value='${items[b].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='permit_endorsement_date' value='${items[b].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Approval Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#permit_approval_tbody").empty();
                for (var c = 0; c < items.length; c++) {
                    $("#permit_approval_tbody").append(`<tr>
                    <td><input type='text' id='permit_approval_name' value='${items[c].Title}' readonly  /></td>
                    <td><input type='text' id='permit_approval_company' value='${items[c].Company}' readonly  /></td>
                    <td><input type='text' id='permit_approval_position' value='${items[c].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='permit_approval_date' value='${items[c].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("HSE Department Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#hse_department_tbody").empty();
                for (var d = 0; d < items.length; d++) {
                    $("#hse_department_tbody").append(`<tr>
                    <td><input type='text' id='hse_department_name' value='${items[d].Title}' readonly  /></td>
                    <td><input type='text' id='hse_department_company' value='${items[d].Company}' readonly  /></td>
                    <td><input type='text' id='hse_department_position' value='${items[d].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='hse_department_date' value='${items[d].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Authorization Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#permit_authorization_tbody").empty();
                for (var e = 0; e < items.length; e++) {
                    $("#permit_authorization_tbody").append(`<tr>
                    <td><input type='text' id='permit_authorization_name' value='${items[e].Title}' readonly  /></td>
                    <td><input type='text' id='permit_authorization_company' value='${items[e].Company}' readonly  /></td>
                    <td><input type='text' id='permit_authorization_position' value='${items[e].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='permit_authorization_date' value='${items[e].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Worksite Issue Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#worksite_timings_tbody").empty();
                for (var f = 0; f < items.length; f++) {
                    $("#worksite_timings_tbody").append(`<tr>
                    <td><input readonly value='${items[f].Date}' type='date' id='worksite_date' /></td>
                    <td><input readonly value='${items[f].Shift}' type='text' id='shift' /></td>
                    <td><input readonly value='${items[f].TimeFrom}' type='datetime-local' id='time_from' /></td>
                    <td><input readonly value='${items[f].TimeTo}' type='datetime-local' id='time_to' /></td>
                    <td><input readonly value='${items[f].AAName}' type='text' id='aa_name' /></td>
                    <td><input readonly value='${items[f].PITime}' type='text' id='pi_time' /></td>
                    <td><input readonly value='${items[f].PIName}' type='text' id='pi_name' /></td>
                    <td><input readonly value='${items[f].JPTime}' type='text' id='jp_time' /></td>
                    <td><input readonly value='${items[f].JPName}' type='text' id='jp_name' /></td>
                    <td><input readonly value='${items[f].PermitJPTime}' type='text' id='permit_jp_time' /></td>
                    <td><input readonly value='${items[f].PermitJPName}' type='text' id='permit_jp_name' /></td>
                    <td><input readonly value='${items[f].PermitAATime}' type='text' id='permit_aa_time' /></td>
                    <td><input readonly value='${items[f].PermitAAName}' type='text' id='permit_aa_name' /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Return Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#permit_return_tbody").empty();
                for (var g = 0; g < items.length; g++) {
                    $("#permit_return_tbody").append(`<tr>
                    <td><input type='text' id='permit_return_name' value='${items[g].Title}' readonly  /></td>
                    <td><input type='text' id='permit_return_company' value='${items[g].Company}' readonly  /></td>
                    <td><input type='text' id='permit_return_position' value='${items[g].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='permit_return_date' value='${items[g].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
        NewWeb.lists.getByTitle("Permit Closure Table Transaction").items.filter(`RequestID eq '${Requestid}'`).orderBy("OrderNo", true).get().then((items) => {
            if (items.length != 0) {
                $("#permit_closure_tbody").empty();
                for (var h = 0; h < items.length; h++) {
                    $("#permit_closure_tbody").append(`<tr>
                    <td><p className='roles' value='${items[h].Role}' readonly>Permit Issuer</p></td>
                    <td><input type='text' id='permit_closure_name' value='${items[h].Title}' readonly  /></td>
                    <td><input type='text' id='permit_closure_company' value='${items[h].Company}' readonly  /></td>
                    <td><input type='text' id='permit_closure_position' value='${items[h].Position}' readonly  /></td>
                    <td><input type='datetime-local' id='permit_closure_date' value='${items[h].Date}' readonly  /></td>
                </tr>`)
                }
            }
        });
    }


    public render(): React.ReactElement<IHotWorkProps> {
        SPComponentLoader.loadCss(`${this.props.siteurl}/SiteAssets/AlQasimiForms/css/style.css?v=1.4`);
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
        const indexOfLastItem = this.state.currentPage * this.state.itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - this.state.itemsPerPage;

        return (
            <>
                {this.state.ShowViewForm == true &&
                    <div>
                        <header>
                            <div className="container clearfix">
                                <div className="logo">
                                    <a href="#"> <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/Logo.png`} alt="image" /> </a>
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
                        <section>
                            <div className="container">
                                <div className="form_banner clearfix">
                                    <div className="header_form">
                                        <div onClick={() => this.gotToDashboard()}>
                                            <a href="#" className='tooltip-back'>
                                                <img src={`${this.props.siteurl}/SiteAssets/AlQasimiForms/img/next.svg`} /> <span className='tooltiptext-back'>back</span>
                                            </a>
                                        </div>
                                        <h2>HOT WORK PERMIT</h2>
                                        {/* <p className='UniqueID'>{this.state.UniqueId} </p> */}
                                    </div>
                                    <div className='section1 forms' style={{ display: indexOfFirstItem <= 0 && indexOfLastItem >= 1 ? 'block' : 'none' }}>
                                        <h4>PERMIT REQUEST</h4>
                                        <div className="form_block">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label> Nature of Work </label>
                                                        <textarea id="work_nature" className="form-control" ></textarea>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Work Title</label>
                                                        <textarea id="work_title" className="form-control" ></textarea>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label> Planned Start Date </label>
                                                        <input type="date" id="start_date" className="form-control" />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label> Planned Finish Date </label>
                                                        <input type="date" id="end_date" className="form-control" />
                                                    </div>
                                                </div>



                                            </div>
                                            <div className="table-responsive">
                                                <table className="table" id="permit_request">

                                                    <thead>
                                                        <tr className="open">
                                                            <th colSpan={2}>Location/Equipment</th>
                                                            <th >Area</th>
                                                            <th colSpan={4} >Process/Restricted</th>
                                                            <th colSpan={6}>Non-Process/Unrestricted</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody id="permit_request_tbody">
                                                        <tr>
                                                            <td><p className='location'>Location/Area</p></td>
                                                            <td><input type='text' className='location_value' /></td>
                                                            <td><p className='area'>H2S Zone </p></td>
                                                            <td>R</td>
                                                            <td><input type='checkbox' className='process_r' /></td>
                                                            <td>A</td>
                                                            <td><input type='checkbox' className='process_a' /></td>
                                                            <td>Y</td>
                                                            <td><input type='checkbox' className='non_process_y' /></td>
                                                            <td>G</td>
                                                            <td><input type='checkbox' className='non_process_g' /></td>
                                                            <td>NC</td>
                                                            <td><input type='checkbox' className='non_process_nc' /></td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='location'>Equipment ID/Tag No</p></td>
                                                            <td><input type='text' className='location_value' /></td>
                                                            <td><p className='area'>HAC Zone</p></td>
                                                            <td>0</td>
                                                            <td><input type='checkbox' className='process_r' /></td>
                                                            <td>1</td>
                                                            <td><input type='checkbox' className='process_a' /></td>
                                                            <td>2</td>
                                                            <td><input type='checkbox' className='non_process_y' /></td>
                                                            <td>G</td>
                                                            <td><input type='checkbox' className='non_process_g' /></td>
                                                            <td>NC</td>
                                                            <td><input type='checkbox' className='non_process_nc' /></td>
                                                        </tr>

                                                    </tbody>

                                                    {/* <tfoot>
                          <tr className='final-row'>
                            <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow()}> Add New </a></div></td>
                          </tr>
                        </tfoot> */}

                                                </table>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Equipment Description </label>
                                                        <textarea id="equipment_description" className="form-control"></textarea>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label> HAC Hazardous Area classification  </label>
                                                        <textarea id="hazardous_description" className="form-control"></textarea>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label> Description of Work </label>
                                                        <textarea id="work_description" className="form-control"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h6> Work Equipments Details</h6>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Tools to be used</label>
                                                            <input type='text' id='tools' className="form-control" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Source of ignition</label>
                                                            <input type='text' id='source_ignition' className="form-control" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Hazardous Materials Involved</label>
                                                            <textarea id="hazardous_materials" className="form-control"></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Job Performer (JP) Details</label>
                                                            <textarea id="job_performer" className="form-control"></textarea>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Section/Department</label>
                                                            <input type='text' id='section' className="form-control" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Name(s)</label>
                                                            <input type='text' id='name' className="form-control" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Planned No.of Workers</label>
                                                            <input type='text' id='no_of_workers' className="form-control" />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Contractor</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="contractor" id="contractor1" />
                                                                    <label className="form-check-label" htmlFor="contractor1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="contractor" id="contractor2" />
                                                                    <label className="form-check-label" htmlFor="contractor2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Work Planning</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="planning" id="planned1" />
                                                                    <label className="form-check-label" htmlFor="planned1">Planned</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="planning" id="planned2" />
                                                                    <label className="form-check-label" htmlFor="planned2">Break-in/Emergency</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='permit-text'>
                                                <h6>Work Permit Request by Performing Authority (PA)</h6>
                                                <p>I confirm that the details in the permit and associated attachments provide a clear description of the work to be performed including tools materials and any specialist skills required . I declare that the JP identified for the work activity is competent to conduct the specified work activity.</p>
                                                <div className="table-responsive">
                                                    <table className="table" id="work_permit">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name (Performing Authority)</th>
                                                                <th>Company/Contractor</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="work_permit_tbody">
                                                            <tr>
                                                                <td><input type='text' id='Work_permit_name' /></td>
                                                                <td><input type='text' id='Work_permit_company' /></td>
                                                                <td><input type='text' id='Work_permit_position' /></td>
                                                                <td><input type='datetime-local' id='Work_permit_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level1Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section1")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section2 forms' style={{ display: indexOfFirstItem <= 1 && indexOfLastItem >= 2 ? 'block' : 'none' }}>
                                        <h4>WORKSITE CONTROL AND SUPPORTING DOCUMENTS</h4>
                                        <div className="form_block">
                                            <div className="table-responsive">
                                                <table className="table" id="worksite">
                                                    <thead>
                                                        <tr className="open">
                                                            <th> Certificates</th>
                                                            <th>(If reqd.)</th>
                                                            <th>No #</th>
                                                            <th>File Upload</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody id="worksite_tbody">
                                                        <tr>
                                                            <td><p className='worksite'>Electrical Isolation</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                {/* <input type='file' className='certificate_files' /> */}
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input1" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_1" className='filename'></span>
                                                                        <input id="file-input1" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 1)} />
                                                                    </label>
                                                                </div></td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>P/I /M Isolation</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input2" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_2" className='filename'></span>
                                                                        <input id="file-input2" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 2)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Temp Defeat</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input3" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_3" className='filename'></span>
                                                                        <input id="file-input3" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 3)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Atmospheric Test</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input4" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_4" className='filename'></span>
                                                                        <input id="file-input4" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 4)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Confined Space Entry</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input5" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_5" className='filename'></span>
                                                                        <input id="file-input5" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 5)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Ionizing radiation</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input6" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_6" className='filename'></span>
                                                                        <input id="file-input6" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 6)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Vehicle Entry</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input7" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_7" className='filename'></span>
                                                                        <input id="file-input7" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 7)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Excavation</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input8" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_8" className='filename'></span>
                                                                        <input id="file-input8" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 8)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Diving</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input9" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_9" className='filename'></span>
                                                                        <input id="file-input9" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 9)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Road Closure</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input10" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_10" className='filename'></span>
                                                                        <input id="file-input10" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 10)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksite'>Easement</p></td>
                                                            <td><input type='checkbox' className='required' /></td>
                                                            <td><input type='text' className='file_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="file-input11" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="row_11" className='filename'></span>
                                                                        <input id="file-input11" className="requestor-file-upload certificate_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayFileName(e, 11)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table" id="worksite_Attachments">
                                                    <thead>
                                                        <tr className="open">
                                                            <th> Attachments</th>
                                                            <th>(If reqd.)</th>
                                                            <th>No #</th>
                                                            <th>File Upload</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody id="worksite_Attachments_tbody">
                                                        <tr>
                                                            <td><p className='worksitess'>Method Statement</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                {/* <input type='file' className='attach_files' /> */}
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input1" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_1" className='filename'></span>
                                                                        <input id="files-input1" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 1)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Lifting Plan</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input2" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_2" className='filename'></span>
                                                                        <input id="files-input2" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 2)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>P&ID</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input3" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_3" className='filename'></span>
                                                                        <input id="files-input3" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 3)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Rescue Plan</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input4" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_4" className='filename'></span>
                                                                        <input id="files-input4" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 4)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Journey management plan</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input5" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_5" className='filename'></span>
                                                                        <input id="files-input5" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 5)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Hazards & Control Sheet</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input6" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_6" className='filename'></span>
                                                                        <input id="files-input6" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 6)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Job Safety Analysis (Level)</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input7" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_7" className='filename'></span>
                                                                        <input id="files-input7" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 7)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Associated Permit</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input8" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_8" className='filename'></span>
                                                                        <input id="files-input8" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 8)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Other:</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input9" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_9" className='filename'></span>
                                                                        <input id="files-input9" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 9)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Other:</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input10" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_10" className='filename'></span>
                                                                        <input id="files-input10" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 10)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><p className='worksitess'>Other:</p></td>
                                                            <td><input type='checkbox' className='attch_req' /></td>
                                                            <td><input type='text' className='attch_no' /></td>
                                                            <td>
                                                                <div className="image-upload">
                                                                    <label htmlFor="files-input11" className="img-upload">
                                                                        <h5>
                                                                            <img src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/upload.svg"
                                                                                data-themekey="#" />
                                                                            <span>Upload</span>
                                                                        </h5>
                                                                        <span id="rows_11" className='filename'></span>
                                                                        <input id="files-input11" className="requestor-file-upload attach_files"
                                                                            name="requestor-file-upload" type="file" onChange={(e) => this.displayAttachmentsFileName(e, 11)} />
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>JSA</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="JSA" id="L2" />
                                                                <label className="form-check-label" htmlFor="L2">L2</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="JSA" id="fra" />
                                                                <label className="form-check-label" htmlFor="fra">FRA</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>Remote Field Operation(RFO)</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="RFO" id="rfo1" />
                                                                <label className="form-check-label" htmlFor="rfo1">Yes</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="RFO" id="rfo2" />
                                                                <label className="form-check-label" htmlFor="rfo2">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>Planned SIMOPS</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="simops" id="ops1" />
                                                                <label className="form-check-label" htmlFor="ops1">Yes</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="simops" id="ops2" />
                                                                <label className="form-check-label" htmlFor="ops2">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>PA Worksite presence required</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="worksite_presence" id="pa1" />
                                                                <label className="form-check-label" htmlFor="pa1">Yes</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="worksite_presence" id="pa2" />
                                                                <label className="form-check-label" htmlFor="pa2">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Special Precautions</label>
                                                        <textarea id="precaution" className="form-control" ></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <h6>Work Permit Validation by Area Authority (AA) </h6>
                                                <p>I confirm that the details in the permit and associated attachments is clear, valid and can proceed further in the PTW process.</p>
                                                <div className="table-responsive">
                                                    <table className="table" id="worksite_permit">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="worksite_permit_tbody">
                                                            <tr>
                                                                <td><input type='text' id='worksite_permit_name' /></td>
                                                                <td><input type='text' id='worksite_permit_company' /></td>
                                                                <td><input type='text' id='worksite_permit_position' /></td>
                                                                <td><input type='datetime-local' id='worksite_permit_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level2Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section2")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section3 forms' style={{ display: indexOfFirstItem <= 2 && indexOfLastItem >= 3 ? 'block' : 'none' }}>
                                        <h4>PERMIT ENDORSEMENT</h4>
                                        <div className="form_block">
                                            <div>
                                                <p>I have reviewed the work scope and controls identified to mitigate interface/ concurrent activities agreed that the work described may be carried out during the proposed period.</p>
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_endorsement">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="permit_endorsement_tbody">
                                                            <tr>
                                                                <td><input type='text' id='permit_endorsement_name' /></td>
                                                                <td><input type='text' id='permit_endorsement_company' /></td>
                                                                <td><input type='text' id='permit_endorsement_position' /></td>
                                                                <td><input type='datetime-local' id='permit_endorsement_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level3Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section3")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section4 forms' style={{ display: indexOfFirstItem <= 3 && indexOfLastItem >= 4 ? 'block' : 'none' }}>
                                        <h4>PERMIT APPROVAL</h4>
                                        <div className="form_block">
                                            <div>
                                                <p>I have reviewed the permit and the attachments and confirm that the described controls are adequate to reduce the risks associated with the work to ALARP.I confirm that permit can proceed to authorization and work can commence when all the specified controls and precautions are in place.</p>
                                                <p>Validity of Approval <input type='number' id='pa_validity' /> days.</p>
                                                Note: <input type='text' id='pa_note' title=' Mention days if less than maximum limit of consecutive 7 calendar days' placeholder=' Mention days if less than maximum limit of consecutive 7 calendar days' />
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_approval">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name (Asset Approval Authority-AAA)</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="permit_approval_tbody">
                                                            <tr>
                                                                <td><input type='text' id='permit_approval_name' /></td>
                                                                <td><input type='text' id='permit_approval_company' /></td>
                                                                <td><input type='text' id='permit_approval_position' /></td>
                                                                <td><input type='datetime-local' id='permit_approval_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level4Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section4")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section5 forms' style={{ display: indexOfFirstItem <= 4 && indexOfLastItem >= 5 ? 'block' : 'none' }}>
                                        <h4>HSE DEPARTMENT</h4>
                                        <div className="form_block">
                                            <div>
                                                <p>I have reviewed the permit and the attachments and confirm that the described controls are adequate to reduce the risks associated with the work to ALARP.I confirm that permit can proceed to authorization and work can commence when all the specified controls and precautions are in place.</p>
                                                <div className="table-responsive">
                                                    <table className="table" id="hse_department">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="hse_department_tbody">
                                                            <tr>
                                                                <td><input type='text' id='hse_department_name' /></td>
                                                                <td><input type='text' id='hse_department_company' /></td>
                                                                <td><input type='text' id='hse_department_position' /></td>
                                                                <td><input type='datetime-local' id='hse_department_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level5Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section5")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section6 forms' style={{ display: indexOfFirstItem <= 5 && indexOfLastItem >= 6 ? 'block' : 'none' }}>
                                        <h4>PERMIT AUTHORIZATION</h4>
                                        <div className="form_block">
                                            <div className="row">
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>Zero Energy Demonstration</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="energy" id="energy1" />
                                                                <label className="form-check-label" htmlFor="energy1">If required</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="energy" id="energy2" />
                                                                <label className="form-check-label" htmlFor="energy2">If not required</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3 radio_block">
                                                    <div className="form-group">
                                                        <label>Authorization Delegation</label>
                                                        <div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="delegation" id="delegation1" />
                                                                <label className="form-check-label" htmlFor="delegation1"> If delegated to PI for RFO</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="delegation" id="delegation2" />
                                                                <label className="form-check-label" htmlFor="delegation2">No</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <p>I have reviewed the permit and the attachments and confirm that the described controls are adequate to reduce the risks associated with the work to ALARP.I confirm that all prerequisite control have been implemented as per the requirements of the permit. All precautions will be communicated to the Job Performer(JP) before start of the work by the PI. There is no geographic or timing conflicts with any other work permit or activity.</p>
                                                <p>Validity of Permit* <input type='number' id='permit_validity' /> Days.</p>
                                                Note: <input type='text' id='permit_note' title=' Mention days if less than maximum limit of consecutive 7 calendar days' placeholder=' Mention days if less than maximum limit of consecutive 7 calendar days' />
                                                <p>Valid from ** <input type='datetime-local' id='permit_valid_from' /> Date. Valid Till** <input type='datetime-local' id='permit_valid_till' /> hrs</p>
                                                <span>Note: In case of Remote field operations(RFO),the zero energy demonstration will be done by delegated personnel with the assistance of other isolating authorities. Further AA authorization shall be done by PI as delegated.</span>
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_authorization">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name (Area Authority)</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="permit_authorization_tbody">
                                                            <tr>
                                                                <td><input type='text' id='permit_authorization_name' /></td>
                                                                <td><input type='text' id='permit_authorization_company' /></td>
                                                                <td><input type='text' id='permit_authorization_postion' /></td>
                                                                <td><input type='datetime-local' id='permit_authorization_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level6Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section6")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section7 forms' style={{ display: indexOfFirstItem <= 6 && indexOfLastItem >= 7 ? 'block' : 'none' }}>
                                        <h4>WORKSITE ISSUE & SUSPENSION</h4>
                                        <div className="form_block">
                                            <div className="table-responsive">
                                                <table className="table" id="worksite">
                                                    <thead>
                                                        <tr className="open">
                                                            <th>Area Authority (AA)</th>
                                                            <th>Permit Issuer(PI)</th>
                                                            <th>Job Performer</th>
                                                            <th>Job Performer</th>
                                                            <th>AA</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="worksite_tbody">
                                                        <tr>
                                                            <td>I confirm that all worksite Controls are still in place and effective as per the requirement of the permit. There is no geographic or timing conflicts with any other work permit or activity.</td>
                                                            <td>I have checked worksite controls specified on the permit,demonstrated zero energy(as applicable) & informed on-site emergency instructions to JP.I confirm worksite is safe to commence work.</td>
                                                            <td>I accept the worksite as safe to commence work. And I have witnessed Zero energy (as applicable) I will communicate the hazards and permit controls and conditions to work party members including the JSA/ Risk Assessment or SMCS requirements via TBT and remain at work place for the description of work I understand the work acceptance precautions to be taken. I agree to abide by the control and requirements described in the permit. I agree to not commence the work until clearance has been provided by the permit issuer(PI).</td>
                                                            <td>I have examined the work site and confirm that it has been left in safe condition. I hereby suspend the permit and confirm that my permit card is returned to control room.</td>
                                                            <td>If not suspended by JP* I have examined the work place and confirm that it has been left in safe conditional. Hereby suspend the permit</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table" id="worksite_timings">
                                                    <thead>
                                                        <tr className="open">
                                                            <th>Date</th>
                                                            <th>Shift/Extension</th>
                                                            <th>Time From</th>
                                                            <th>Time To</th>
                                                            <th>Name & Initials</th>
                                                            <th>Time</th>
                                                            <th>Name & Initials</th>
                                                            <th>Time</th>
                                                            <th>Name & Initials</th>
                                                            <th>Time</th>
                                                            <th>Name & Initials</th>
                                                            <th>Time</th>
                                                            <th>Name & Initials</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="worksite_timings_tbody">
                                                        <tr>
                                                            <td><input type='date' id='worksite_date' /></td>
                                                            <td><input type='text' id='shift' /></td>
                                                            <td><input type='datetime-local' id='time_from' /></td>
                                                            <td><input type='datetime-local' id='time_to' /></td>
                                                            <td><input type='text' id='aa_name' /></td>
                                                            <td><input type='text' id='pi_time' /></td>
                                                            <td><input type='text' id='pi_name' /></td>
                                                            <td><input type='text' id='jp_time' /></td>
                                                            <td><input type='text' id='jp_name' /></td>
                                                            <td><input type='text' id='permit_jp_time' /></td>
                                                            <td><input type='text' id='permit_jp_name' /></td>
                                                            <td><input type='text' id='permit_aa_time' /></td>
                                                            <td><input type='text' id='permit_aa_name' /></td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className='final-row'>
                                                            <td colSpan={13}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level7Table")}> Add New </a></div></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section7")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='section8 forms' style={{ display: indexOfFirstItem <= 7 && indexOfLastItem >= 8 ? 'block' : 'none' }}>
                                        <h4>PERMIT CLOSURE</h4>
                                        <div className="form_block">
                                            <div>
                                                <p>Permit Return</p>
                                                <div className="row">
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Work site clear</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="work_clear" id="worksite1" />
                                                                    <label className="form-check-label" htmlFor="worksite1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="work_clear" id="worksite2" />
                                                                    <label className="form-check-label" htmlFor="worksite2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Housekeeping is satisfactory</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_house" id="housekeeping1" />
                                                                    <label className="form-check-label" htmlFor="housekeeping1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_house" id="housekeeping2" />
                                                                    <label className="form-check-label" htmlFor="housekeeping2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Equipment left in safe condition</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_equipment_left" id="equipment1" />
                                                                    <label className="form-check-label" htmlFor="equipment1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_equipment_left" id="equipment2" />
                                                                    <label className="form-check-label" htmlFor="equipment2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Equipment ready to return to service</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_equipment_ready" id="service1" />
                                                                    <label className="form-check-label" htmlFor="service1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_equipment_ready" id="service2" />
                                                                    <label className="form-check-label" htmlFor="service2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Work Complete</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_work_complete" id="work1" />
                                                                    <label className="form-check-label" htmlFor="work1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_work_complete" id="work2" />
                                                                    <label className="form-check-label" htmlFor="work2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Permit Cancelled</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_permit_cancelled" id="permit1" />
                                                                    <label className="form-check-label" htmlFor="permit1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pr_permit_cancelled" id="permit2" />
                                                                    <label className="form-check-label" htmlFor="permit2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_return">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Name (Performing Authority)</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="permit_return_tbody">
                                                            <tr>
                                                                <td><input type='text' id='permit_return_name' /></td>
                                                                <td><input type='text' id='permit_return_company' /></td>
                                                                <td><input type='text' id='permit_return_position' /></td>
                                                                <td><input type='datetime-local' id='permit_return_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className='final-row'>
                                                                <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addNewRow("Level8Table")}> Add New </a></div></td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                            <div>
                                                <p> Permit Closure</p>
                                                <div className="row">
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Work site clear</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_worksite" id="worksites1" />
                                                                    <label className="form-check-label" htmlFor="worksites1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_worksite" id="worksites2" />
                                                                    <label className="form-check-label" htmlFor="worksites2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Housekeeping is satisfactory</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_house" id="housekeepings1" />
                                                                    <label className="form-check-label" htmlFor="housekeepings1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_house" id="housekeepings2" />
                                                                    <label className="form-check-label" htmlFor="housekeepings2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3 radio_block">
                                                        <div className="form-group">
                                                            <label>Equipment left in safe condition</label>
                                                            <div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_equipment_left" id="equipments1" />
                                                                    <label className="form-check-label" htmlFor="equipments1">Yes</label>
                                                                </div>
                                                                <div className="form-check">
                                                                    <input className="form-check-input" type="radio" name="pc_equipment_left" id="equipments2" />
                                                                    <label className="form-check-label" htmlFor="equipments2">No</label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Work continuing under Permit No</label>
                                                            <input type="text" id="permit_no" className="form-control" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table" id="permit_closure">
                                                        <thead>
                                                            <tr className="open">
                                                                <th>Role</th>
                                                                <th>Name</th>
                                                                <th>Company</th>
                                                                <th>Position</th>
                                                                <th>Date & Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody id="permit_closure_tbody">
                                                            <tr>
                                                                <td><p className='roles'>Permit Issuer</p></td>
                                                                <td><input type='text' id='permit_closure_name' /></td>
                                                                <td><input type='text' id='permit_closure_company' /></td>
                                                                <td><input type='text' id='permit_closure_position' /></td>
                                                                <td><input type='datetime-local' id='permit_closure_date' /></td>
                                                            </tr>
                                                            <tr>
                                                                <td><p className='roles'>Area Authority </p></td>
                                                                <td><input type='text' id='permit_closure_name' /></td>
                                                                <td><input type='text' id='permit_closure_company' /></td>
                                                                <td><input type='text' id='permit_closure_position' /></td>
                                                                <td><input type='datetime-local' id='permit_closure_date' /></td>
                                                            </tr>
                                                        </tbody>
                                                        {/* <tfoot>
                            <tr className='final-row'>
                              <td colSpan={7}> <div className="Add_new"> <a href="#" onClick={() => this.addRowInPermitClosure()}> Add New </a></div></td>
                            </tr>
                          </tfoot> */}
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="button">
                                            <button className="submit_btn" onClick={() => this.saveDetails("Section8")}> Submit </button>
                                            <button className="cancel_btn"> Cancel </button>
                                        </div>
                                    </div>
                                    <div className='prev-next-wrap'>
                                        {this.state.currentPage != 1 &&
                                            <img onClick={() => this.setState({ currentPage: this.state.currentPage - 1 })} src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/prev-icon.svg" className="prev-icon" />
                                        }
                                        {indexOfLastItem <= 7 &&
                                            <img onClick={() => this.setState({ currentPage: this.state.currentPage + 1 })} src="https://remodigital.sharepoint.com/sites/Remo/RemoSolutions/DigitalForms/POC/SiteAssets/AlQasimiForms/img/next-icon.svg" className="next-icon" />
                                        }
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* <PeoplePicker
            context={this.props.context as any}
            errorMessageClassName="has error"
            personSelectionLimit={2}
            groupName={""}
            showtooltip={false}
            required={true}
            disabled={false}
            ensureUser={true}
            onChange={(item: any[]) => {
              console.log("people", item)
            }}
            placeholder="Search for a user name"
            showHiddenInUI={false}
            principalTypes={[PrincipalType.User]}
            resolveDelay={1000}
          // defaultSelectedUsers={this.state.defaultPicker}
          /> */}
                    </div>
                }
                {
                    this.state.ShowDashboard == true &&
                    <HotWork
                        itemId={0}
                        description={""}
                        context={this.props.context}
                        siteurl={this.props.siteurl} isDarkTheme={false} environmentMessage={''} hasTeamsContext={false} userDisplayName={''} />
                }

            </>
        );
    }
}
