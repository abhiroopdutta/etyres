import React, { useContext, useState, useEffect } from "react";
import styles from "./HeaderContainer.module.css";
import { message } from "antd";
import { SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import Button from "../Button";
import { dayjsUTC } from "../dayjsUTCLocal";

function Cart() {
    const headers = ["Cashbox", "ICICI Bank", "Maharashtra Bank", "Rent", "Employee Salary", "Electricity", "Misc"];

    return (
        <div className={styles["entities-container"]}>
            <header>
                <div className={styles["entities-header"]}>
                    <h5 className={styles["entities-title"]}>Headers</h5>
                    <Button
                        text="+"
                        className={styles["add-entity-btn"]}
                    />

                </div>
                <div className={styles["entities-search"]}>
                    <label htmlFor="search-box"></label>
                    <input id="search-box" type="text" placeholder="Find or search headers" />
                    <SearchOutlined />
                </div>
            </header>


            <section className={styles["entities-section-container"]}>
                <div className={styles["entities"]}>
                    {headers.map((header) => (
                        <div>
                            <div className={styles["entity-container"]}>
                                <h4>{header}</h4>
                                <InfoCircleOutlined className={styles["info-icon"]} />
                            </div>
                        </div>
                    ))}

                </div>
            </section>
        </div>

    );
}

export default Cart;
